<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MemberController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Member::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email',
        ]);

        $member = Member::create($validated);
        return response()->json($member, 201);
    }
}
