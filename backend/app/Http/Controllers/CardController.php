<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CardController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'card_list_id' => 'required|exists:card_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'position' => 'nullable|integer',
        ]);

        if (!isset($validated['position'])) {
            $validated['position'] = Card::where('card_list_id', $validated['card_list_id'])->count();
        }

        $card = Card::create($validated);

        // Load relations for response
        $card->load(['tags', 'members']);

        return response()->json($card, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'card_list_id' => 'nullable|exists:card_lists,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'position' => 'nullable|integer',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'members' => 'nullable|array',
            'members.*' => 'exists:members,id',
        ]);

        // Update core card fields
        $card->update($request->only(['card_list_id', 'title', 'description', 'due_date', 'position']));

        // Sync tags if provided
        if ($request->has('tags')) {
            $card->tags()->sync($validated['tags']);
        }

        // Sync members if provided
        if ($request->has('members')) {
            $card->members()->sync($validated['members']);
        }

        $card->load(['tags', 'members']);

        return response()->json($card);
    }

    public function destroy(string $id): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->delete();
        return response()->json(['message' => 'Card deleted successfully']);
    }

    public function updatePositions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'positions' => 'required|array',
            'positions.*.id' => 'required|exists:cards,id',
            'positions.*.card_list_id' => 'required|exists:card_lists,id',
            'positions.*.position' => 'required|integer',
        ]);

        foreach ($validated['positions'] as $item) {
            Card::where('id', $item['id'])->update([
                'card_list_id' => $item['card_list_id'],
                'position' => $item['position']
            ]);
        }

        return response()->json(['message' => 'Card positions updated successfully']);
    }
}
