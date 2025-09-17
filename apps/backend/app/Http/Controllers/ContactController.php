<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Rules\Cpf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::query()->where('user_id', $request->user()->id);

        $term = mb_strtolower(trim((string) $request->query('q', '')));
        if ($term !== '') {
            $query->where(function ($w) use ($term) {
                $w->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"])
                    ->orWhereRaw('cpf LIKE ?', ["%{$term}%"]); // cpf é numérico, LOWER não muda
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

    public function show(Request $request, int $id)
    {
        $c = Contact::where('user_id', $request->user()->id)->findOrFail($id);
        return $c;
    }

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


    public function destroy(Request $request, int $id)
    {
        $c = Contact::where('user_id', $request->user()->id)->findOrFail($id);
        $c->delete();
        return response()->noContent();
    }

    private function geocode(array $addr): array
    {
        $address = "{$addr['street']}, {$addr['number']}, {$addr['city']} - {$addr['state']}, {$addr['cep']}";
        $resp = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $address,
            'key'     => config('services.google.maps_key'),
            'region'  => 'br',
        ])->json();

        $loc = $resp['results'][0]['geometry']['location'] ?? null;
        abort_unless($loc, 422, 'Não foi possível geocodificar o endereço.');
        return [round($loc['lat'], 7), round($loc['lng'], 7)];
    }
}
