<?php

namespace App\Listeners;

use App\Events\ModelAudited;
use App\Models\Audit;

class StoreAuditLog
{
    public function handle(ModelAudited $event)
    {
        Audit::create([
            'user_id' => $event->user->id,
            'action' => $event->action,
            'model_type' => get_class($event->model),
            'model_id' => $event->model->id,
            'changes' => $event->changes,
        ]);
    }
}