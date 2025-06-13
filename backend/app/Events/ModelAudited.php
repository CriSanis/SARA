<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class ModelAudited
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $action;
    public $model;
    public $changes;

    public function __construct(User $user, string $action, $model, array $changes = [])
    {
        $this->user = $user;
        $this->action = $action;
        $this->model = $model;
        $this->changes = $changes;
    }
}