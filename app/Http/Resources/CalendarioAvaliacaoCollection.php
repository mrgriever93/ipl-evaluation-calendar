<?php

namespace App\Http\Resources;

use App\Models\Epoca;
use App\Models\Avaliacao;
use App\Http\Resources\CalendarioAvaliacaoResource;
use Illuminate\Support\Arr;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CalendarioAvaliacaoCollection extends ResourceCollection
{
    private $appends;
    private $meta;

    public function __construct($resource, $appends)
    {
        $this->meta = [
            'total'         => $resource->total(),
            'count'         => $resource->count(),
            'per_page'      => $resource->perPage(),
            'current_page'  => $resource->currentPage(),
            'last_page'     => $resource->lastPage(),
            'path'          => $resource->path()
        ];

        $this->appends = $appends;

        $resource = $resource->getCollection();

        parent::__construct($resource);
    }

    public function toArray($request)
    {
        // limpar o atributo "page"
        unset($this->appends['page']);

       // dd($this->appends);

        // gerar url completo
        $queryString = '?' . http_build_query($this->appends) . '&page=';

        if(count($this->appends)==0) {
            $queryString = '?page=';
        }

        return [
            'data' => CalendarioAvaliacaoResource::collection($this->collection),
            'links' => [
                'first'     => Arr::get($this->meta, 'path') . $queryString . 1,
                'last'      => Arr::get($this->meta, 'path') . $queryString . Arr::get($this->meta, 'last_page'),
                // 'prev'      => null, // TODO: em falta
                // 'next'      => null, // TODO: em falta
            ],
            'meta' => [
                'current_page'  => Arr::get($this->meta, 'current_page'),
                'last_page'     => Arr::get($this->meta, 'last_page'),
                'path'          => Arr::get($this->meta, 'path'),
                'path_full'     => Arr::get($this->meta, 'path') . '?' . http_build_query($this->appends),
                'per_page'      => Arr::get($this->meta, 'per_page'),
                'total'         => Arr::get($this->meta, 'total'),
                // 'to'            => 0, // TODO: em falta
                // 'from'          => 0, // TODO: em falta
            ],
        ];
    }

    public function appends($appends)
    {
        $this->appends = $appends;
    }

    public function toResponse($request)
    {
        return JsonResource::toResponse($request);
    }
}
