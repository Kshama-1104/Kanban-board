<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BoardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Board::all());
    }

    public function show(string $id): JsonResponse
    {
        $board = Board::with(['cardLists.cards.tags', 'cardLists.cards.members'])
            ->findOrFail($id);
        return response()->json($board);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $board = Board::create($validated);
        return response()->json($board, 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $board = Board::findOrFail($id);
        $board->delete();
        return response()->json(['message' => 'Board deleted successfully']);
    }
}
