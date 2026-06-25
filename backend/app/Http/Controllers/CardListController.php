<?php

namespace App\Http\Controllers;

use App\Models\CardList;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CardListController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name' => 'required|string|max:255',
            'position' => 'nullable|integer',
        ]);

        if (!isset($validated['position'])) {
            $validated['position'] = CardList::where('board_id', $validated['board_id'])->count();
        }

        $list = CardList::create($validated);
        return response()->json($list, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $list = CardList::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'position' => 'nullable|integer',
        ]);

        $list->update($validated);
        return response()->json($list);
    }

    public function destroy(string $id): JsonResponse
    {
        $list = CardList::findOrFail($id);
        $list->delete();
        return response()->json(['message' => 'List deleted successfully']);
    }

    public function updatePositions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'positions' => 'required|array',
            'positions.*.id' => 'required|exists:card_lists,id',
            'positions.*.position' => 'required|integer',
        ]);

        foreach ($validated['positions'] as $item) {
            CardList::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return response()->json(['message' => 'List positions updated successfully']);
    }
}
