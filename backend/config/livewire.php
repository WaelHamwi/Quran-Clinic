<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Temporary File Uploads
    |--------------------------------------------------------------------------
    |
    | Livewire handles file uploads by storing them temporarily before the
    | form is submitted. We pin the temporary disk to 'public' so it matches
    | the disk used by Filament's FileUpload component, preventing the
    | UnableToRetrieveMetadata error that occurs when the disks diverge.
    |
    */

    'temporary_file_upload' => [
        'disk'       => 'public',
        'rules'      => null,
        'directory'  => null,
        'middleware' => 'throttle:60,1',
        'preview_mimes' => [
            'png', 'gif', 'bmp', 'svg', 'wav', 'mp4',
            'mov', 'avi', 'wmv', 'mp3', 'm4a',
            'jpg', 'jpeg', 'mpga', 'webp', 'weba',
        ],
        'max_upload_time' => 5,
        'cleanup'    => true,
    ],

];
