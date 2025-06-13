<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\ModelAudited;
use App\Listeners\StoreAuditLog;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        ModelAudited::class => [
            StoreAuditLog::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
} 