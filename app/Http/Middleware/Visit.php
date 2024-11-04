<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\PageVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class Visit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        PageVisit::create([
            'user_id' => auth()->user()->id,
            'route' => Route::currentRouteName(),
        ]);
        return $next($request);
    }
}
