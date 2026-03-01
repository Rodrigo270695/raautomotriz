<?php

namespace App\Http\Requests\Dashboard\Services;

use App\Models\WorkOrderPhoto;
use Illuminate\Foundation\Http\FormRequest;

class WorkOrderPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('work_order_photos.create') ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:'.implode(',', array_keys(WorkOrderPhoto::$types))],
            'caption' => ['nullable', 'string', 'max:500'],
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => [
                'required',
                'file',
                'mimetypes:image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm',
                'max:51200', // 50MB para video
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'type' => 'tipo',
            'caption' => 'pie de foto',
            'photos' => 'fotos',
            'photos.*' => 'archivo',
        ];
    }
}
