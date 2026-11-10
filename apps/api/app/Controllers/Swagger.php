<?php

namespace App\Controllers;

/**
 * Page Swagger UI. Le contrat est le fichier statique public/openapi.json.
 */
class Swagger extends BaseController
{
    public function index(): string
    {
        return view('swagger/index');
    }
}
