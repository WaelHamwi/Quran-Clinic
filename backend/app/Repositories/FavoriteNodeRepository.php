<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\FavoriteNode;
use App\Models\Subcategory;
use App\Repositories\Contracts\FavoriteNodeRepositoryInterface;
use Illuminate\Support\Collection;

class FavoriteNodeRepository implements FavoriteNodeRepositoryInterface
{
    /**
     * Favorited category/subcategory nodes for a user, each carrying its hydrated
     * `node` (Category or Subcategory) so the API can return name/slug/icon without
     * a second round trip per item.
     */
    public function forUser(int $userId): Collection
    {
        $favorites = FavoriteNode::where('user_id', $userId)->get();

        $categoryIds    = $favorites->where('kind', 'category')->pluck('node_id');
        $subcategoryIds = $favorites->where('kind', 'subcategory')->pluck('node_id');

        $categories = Category::active()->whereIn('id', $categoryIds)->get()->keyBy('id');
        $subcategories = Subcategory::active()->whereIn('id', $subcategoryIds)->get()->keyBy('id');

        return $favorites
            ->map(function (FavoriteNode $favorite) use ($categories, $subcategories) {
                $node = $favorite->kind === 'category'
                    ? $categories->get($favorite->node_id)
                    : $subcategories->get($favorite->node_id);

                return $node ? ['kind' => $favorite->kind, 'node' => $node] : null;
            })
            ->filter()
            ->values();
    }

    public function toggle(int $userId, string $kind, int $nodeId): bool
    {
        return FavoriteNode::toggle($userId, $kind, $nodeId);
    }
}
