<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Rules\Cpf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

/**
 * Controlador responsável pelo gerenciamento de contatos
 * 
 * Este controlador implementa operações CRUD para contatos,
 * incluindo funcionalidades de busca, paginação e geocodificação
 * automática de endereços usando a API do Google Maps.
 */
class ContactController extends Controller
{
    /**
     * Lista os contatos do usuário autenticado com filtros e paginação
     * 
     * @param Request $request Requisição HTTP contendo parâmetros de busca e ordenação
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator Lista paginada de contatos
     */
    public function index(Request $request)
    {
        $query = Contact::query()->where('user_id', $request->user()->id);

        $term = mb_strtolower(trim((string) $request->query('q', '')));
        if ($term !== '') {
            $query->where(function ($w) use ($term) {
                $w->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"])
                    ->orWhereRaw('cpf LIKE ?', ["%{$term}%"]);
            });
        }

        $sort = $request->query('sort', 'name');
        $dir  = strtolower($request->query('dir', 'asc'));
        $per  = (int) $request->query('per_page', 10);

        $allowedSorts = ['name','cpf','created_at'];
        if (!in_array($sort, $allowedSorts, true)) $sort = 'name';
        if (!in_array($dir, ['asc','desc'], true)) $dir = 'asc';

        return $query->orderBy($sort, $dir)->paginate($per);
    }

    /**
     * Cria um novo contato para o usuário autenticado
     * 
     * @param Request $request Requisição HTTP contendo os dados do contato
     * @return \Illuminate\Http\JsonResponse Contato criado com coordenadas geocodificadas
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required','string','max:255'],
            'cpf'        => ['required', new Cpf,
                Rule::unique('contacts','cpf')->where(fn($q) => $q->where('user_id', $request->user()->id))],
            'phone'      => ['required','string','max:20'],
            'cep'        => ['required','digits:8'],
            'state'      => ['required','size:2'],
            'city'       => ['required','string','max:255'],
            'street'     => ['required','string','max:255'],
            'number'     => ['required','string','max:20'],
            'complement' => ['nullable','string','max:255'],
        ]);

        [$lat, $lng] = $this->geocode([
            'cep' => $data['cep'],
            'state' => $data['state'],
            'city' => $data['city'],
            'street' => $data['street'],
            'number' => $data['number'],
        ]);

        $contact = $request->user()
            ->contacts()
            ->create($data + ['lat' => $lat, 'lng' => $lng]);

        return response()->json($contact, 201);
    }

    /**
     * Exibe um contato específico do usuário autenticado
     * 
     * @param Request $request Requisição HTTP
     * @param int $id ID do contato a ser exibido
     * @return Contact Contato encontrado
     */
    public function show(Request $request, int $id)
    {
        $c = Contact::where('user_id', $request->user()->id)->findOrFail($id);
        return $c;
    }

    /**
     * Atualiza um contato existente do usuário autenticado
     * 
     * Realiza geocodificação automática quando dados de endereço são alterados.
     * 
     * @param Request $request Requisição HTTP contendo dados atualizados
     * @param int $id ID do contato a ser atualizado
     * @return Contact Contato atualizado
     */
    public function update(Request $request, int $id)
    {
        $c = Contact::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'name'       => ['sometimes','required','string','max:255'],
            'cpf'        => ['sometimes','required', new \App\Rules\Cpf,
                \Illuminate\Validation\Rule::unique('contacts','cpf')
                    ->where(fn($q) => $q->where('user_id',$request->user()->id))
                    ->ignore($c->id)],
            'phone'      => ['sometimes','required','string','max:20'],
            'cep'        => ['sometimes','required','digits:8'],
            'state'      => ['sometimes','required','size:2'],
            'city'       => ['sometimes','required','string','max:255'],
            'street'     => ['sometimes','required','string','max:255'],
            'number'     => ['sometimes','required','string','max:20'],
            'complement' => ['nullable','string','max:255'],
        ]);
        $addressKeys = ['cep','state','city','street','number'];
        $reGeocode = !empty(array_intersect(array_keys($data), $addressKeys));

        $c->fill($data);

        if ($reGeocode) {
            Log::info('REGEOCODE firing', ['id'=>$c->id, 'street'=>$c->street, 'number'=>$c->number]);
            [$lat, $lng] = $this->geocode([
                'cep'    => $c->cep,
                'state'  => $c->state,
                'city'   => $c->city,
                'street' => $c->street,
                'number' => $c->number,
            ]);
            $c->forceFill(['lat' => $lat, 'lng' => $lng]);
        } else {
            Log::info('REGEOCODE not firing', ['id'=>$c->id]);
        }

        $c->save();

        return $c->fresh();
    }

    /**
     * Remove um contato do usuário autenticado
     * 
     * @param Request $request Requisição HTTP
     * @param int $id ID do contato a ser removido
     * @return \Illuminate\Http\Response Resposta vazia com status 204
     */
    public function destroy(Request $request, int $id)
    {
        $c = Contact::where('user_id', $request->user()->id)->findOrFail($id);
        $c->delete();
        return response()->noContent();
    }

    /**
     * Geocodifica um endereço usando a API do Google Maps
     * 
     * @param array $addr Array associativo contendo dados do endereço
     * @return array Array com latitude e longitude [lat, lng]
     * @throws \Illuminate\Http\Exceptions\HttpResponseException Em caso de erro na geocodificação
     */
    private function geocode(array $addr): array
    {
        $address = "{$addr['street']}, {$addr['number']}, {$addr['city']} - {$addr['state']}, {$addr['cep']}";
        
        try {
            $response = Http::timeout(8)->retry(2, 200)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $address,
                'key'     => config('services.google.maps_key'),
                'region'  => 'br',
            ]);
            
            $resp = $response->json();
        } catch (\Exception $e) {
            abort(503, 'Erro ao consultar serviço de geocodificação. Tente novamente.');
        }

        if (($resp['status'] ?? '') !== 'OK') {
            $errorMessage = match($resp['status'] ?? '') {
                'ZERO_RESULTS' => 'Endereço não encontrado para geocodificação.',
                'OVER_QUERY_LIMIT' => 'Limite de consultas excedido. Tente novamente mais tarde.',
                'REQUEST_DENIED' => 'Acesso negado ao serviço de geocodificação.',
                'INVALID_REQUEST' => 'Requisição inválida para geocodificação.',
                default => 'Erro no serviço de geocodificação: ' . ($resp['error_message'] ?? 'Erro desconhecido')
            };
            abort(422, $errorMessage);
        }

        $loc = $resp['results'][0]['geometry']['location'] ?? null;
        abort_unless($loc, 422, 'Não foi possível obter coordenadas do endereço.');
        
        return [round($loc['lat'], 7), round($loc['lng'], 7)];
    }
}
