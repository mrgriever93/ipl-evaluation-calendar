<?php

namespace App\Http\Controllers\API;

use App\Models\ExamComment;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExamCommentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ExamCommentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ExamCommentRequest $request)
    {
        $newComment = new ExamComment($request->all());
        $newComment->user()->associate(Auth::user());
        $newComment->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    public function ignore(ExamComment $comment) {
        $comment->ignored = true;
        $comment->save();
    }

    public function update(ExamCommentRequest $request, ExamComment $examComment)
    {
        $examComment->fill($request->all());
        $examComment->save();
    }
}
