<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use App\Events\ModelAudited;

trait AdminAuthorization
{
    public function checkAdminRole()
    {
        $user = Auth::user();
        if (!$user || !$user->hasRole('admin')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return null;
    }

    public function auditAction($action, $model, $changes = [])
    {
        event(new \App\Events\ModelAudited(Auth::user(), $action, $model, $changes));
    }
} 