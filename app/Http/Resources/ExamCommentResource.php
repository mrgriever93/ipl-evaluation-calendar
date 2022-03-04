<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamCommentResource extends JsonResource
{
    public function toArray($request)
    {
        $commentDate = Carbon::parse($this->created_at);
        $hoursOfComment = $commentDate->format('H:i');
        $differenceInDays = Carbon::now()->diffInDays($commentDate);

        $formatedDate = "";

        if ($commentDate->isSameDay(Carbon::now())) {
            $formatedDate = "Hoje às {$hoursOfComment}";
        } else if ($commentDate->isYesterday()) {
            $formatedDate = "Ontem às {$hoursOfComment}";
        } else {
            $formatedDate = "Há {$differenceInDays} dias";
        }

        return [
            'id'        => $this->id,
            'comment'   => $this->comment,
            'ignored'   => $this->ignored,
            'date'      => $formatedDate,
            'user'      => new UserResource($this->user),
        ];
    }
}
