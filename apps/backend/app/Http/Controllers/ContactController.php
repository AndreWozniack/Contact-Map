<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use App\Rules\Cpf;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;


class ContactController extends Controller
{
    public function index(Request $request) {
        $query = Contact::query()->where('user_id', $request->user()->id);

        if($term = trim((string)$request->query('query', ''))) {
            $query->where(function ($w) use ($term) {
               $w->where('name', 'like', "%{$term}%")
                    ->orWhere('cpf', 'like', "%{$term}%");
            });
        }

        $sort = $request->query('sort', 'name');
        $dir = str($request->query('dir', 'asc'));
        $per = (int)$request->query('per_page', 10);

        $allowedSorts = ['name', 'cpf', 'created_at'];
        if(!in_array($sort, $allowedSorts, true)) $sort = 'name';
        if(!in_array($dir, ['asc', 'desc'], true)) $dir = 'asc';

        return $query->orderBy($sort, $dir)->paginate($per);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name'       => ['required','string','max:255'],
            'cpf'        => ['required', new Cpf, Rule::unique('contacts','cpf')->where('user_id', $r->user()->id)],
            'phone'      => ['required','string','max:20'],
            'cep'        => ['required','digits:8'],
            'state'      => ['required','size:2'],
            'city'       => ['required','string','max:255'],
            'street'     => ['required','string','max:255'],
            'number'     => ['required','string','max:20'],
            'complement' => ['nullable','string','max:255'],
        ]);
        [$lat, $lng] = $this->geocode($data);

        $contact = Contact::create(array_merge($data, [
            'user_id' => $r->user()->id,
            'lat' => $lat, 'lng' => $lng,
        ]));

        return response()->json($contact, 201);

    }

    public function show(Request $request, id $id) {
        return Contact::where('user_id', $request->user()->id)->findOrFail($id);
    }

    public function update(Request $r, $id)
    {
        $c = Contact::where('user_id', $r->user()->id)->findOrFail($id);

        $data = $r->validate([
            'name'       => ['sometimes','required','string','max:255'],
            'cpf'        => ['sometimes','required', new Cpf,
                Rule::unique('contacts','cpf')->where('user_id', $r->user()->id)->ignore($c->id)],
            'phone'      => ['sometimes','required','string','max:20'],
            'cep'        => ['sometimes','required','digits:8'],
            'state'      => ['sometimes','required','size:2'],
            'city'       => ['sometimes','required','string','max:255'],
            'street'     => ['sometimes','required','string','max:255'],
            'number'     => ['sometimes','required','string','max:20'],
            'complement' => ['nullable','string','max:255'],
        ]);


        if (collect($data)->intersectByKeys(['cep'=>1,'state'=>1,'city'=>1,'street'=>1,'number'=>1])->isNotEmpty()) {
            [$lat,$lng] = $this->geocode(array_merge($c->toArray(), $data));
            $data['lat'] = $lat; $data['lng'] = $lng;
        }

        $c->update($data);
        return $c->fresh();
    }

    public function destroy(Request $r, $id)
    {
        $c = Contact::where('user_id', $r->user()->id)->findOrFail($id);
        $c->delete();
        return response()->noContent();
    }

    private function geocode(array $data): array
    {
        $addr = "{$data['street']}, {$data['number']}, {$data['city']} - {$data['state']}, {$data['cep']}";
        $resp = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $addr,
            'key'     => config('services.google.maps_key'),
            'region'  => 'br',
        ])->json();

        $loc = $resp['results'][0]['geometry']['location'] ?? null;
        abort_unless($loc, 422, 'Não foi possível geocodificar o endereço.');
        return [round($loc['lat'], 7), round($loc['lng'], 7)];
    }
}
