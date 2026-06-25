<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\CardList;
use App\Models\Card;
use App\Models\Tag;
use App\Models\Member;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Tags
        $tagBug = Tag::create(['name' => 'Bug', 'color' => 'hsl(0, 75%, 60%)']);
        $tagFeature = Tag::create(['name' => 'Feature', 'color' => 'hsl(210, 75%, 60%)']);
        $tagDesign = Tag::create(['name' => 'Design', 'color' => 'hsl(280, 70%, 65%)']);
        $tagMarketing = Tag::create(['name' => 'Marketing', 'color' => 'hsl(330, 75%, 60%)']);
        $tagDocs = Tag::create(['name' => 'Docs', 'color' => 'hsl(145, 65%, 50%)']);

        // 2. Create Members
        $memberPriya = Member::create(['name' => 'Priya Sharma', 'email' => 'priya@college.edu']);
        $memberAman = Member::create(['name' => 'Aman Verma', 'email' => 'aman@college.edu']);
        $memberDev = Member::create(['name' => 'Dev Gupta', 'email' => 'dev@college.edu']);

        // 3. Create Board 1: Project Alpha
        $boardAlpha = Board::create(['name' => 'Project Alpha']);

        // Lists for Project Alpha
        $listTodo = CardList::create(['board_id' => $boardAlpha->id, 'name' => 'To Do', 'position' => 0]);
        $listDoing = CardList::create(['board_id' => $boardAlpha->id, 'name' => 'In Progress', 'position' => 1]);
        $listDone = CardList::create(['board_id' => $boardAlpha->id, 'name' => 'Done', 'position' => 2]);

        // Cards for 'To Do'
        $card1 = Card::create([
            'card_list_id' => $listTodo->id,
            'title' => 'Implement Auth System',
            'description' => 'Scaffold authentication routes and integrate with JWT tokens.',
            'due_date' => Carbon::now()->addDays(5),
            'position' => 0
        ]);
        $card1->tags()->attach([$tagFeature->id, $tagDesign->id]);
        $card1->members()->attach([$memberPriya->id]);

        $card2 = Card::create([
            'card_list_id' => $listTodo->id,
            'title' => 'Fix DB connection leak',
            'description' => 'Investigate connection pooling issues with SQLite database when heavy queries run.',
            'due_date' => Carbon::now()->subDays(2), // Overdue card
            'position' => 1
        ]);
        $card2->tags()->attach([$tagBug->id]);
        $card2->members()->attach([$memberDev->id, $memberAman->id]);

        // Cards for 'In Progress'
        $card3 = Card::create([
            'card_list_id' => $listDoing->id,
            'title' => 'Build Kanban columns UI',
            'description' => 'Design clean, translucent glassmorphism panels for columns and implement card lists.',
            'due_date' => Carbon::now()->addDays(2),
            'position' => 0
        ]);
        $card3->tags()->attach([$tagDesign->id, $tagFeature->id]);
        $card3->members()->attach([$memberPriya->id, $memberDev->id]);

        // Cards for 'Done'
        $card4 = Card::create([
            'card_list_id' => $listDone->id,
            'title' => 'Write architecture specifications',
            'description' => 'Draft the initial multi-agent architecture setup document.',
            'due_date' => Carbon::now()->subDays(1),
            'position' => 0
        ]);
        $card4->tags()->attach([$tagDocs->id]);
        $card4->members()->attach([$memberAman->id]);


        // 4. Create Board 2: Marketing Campaign
        $boardMarketing = Board::create(['name' => 'Marketing Campaign']);
        
        $mListPrep = CardList::create(['board_id' => $boardMarketing->id, 'name' => 'Planning', 'position' => 0]);
        $mListLive = CardList::create(['board_id' => $boardMarketing->id, 'name' => 'Live', 'position' => 1]);

        $mCard1 = Card::create([
            'card_list_id' => $mListPrep->id,
            'title' => 'Draft launch email template',
            'description' => 'Write newsletter copy for product version 2.0 release.',
            'due_date' => Carbon::now()->addDays(7),
            'position' => 0
        ]);
        $mCard1->tags()->attach([$tagMarketing->id]);
        $mCard1->members()->attach([$memberPriya->id, $memberAman->id]);
    }
}
