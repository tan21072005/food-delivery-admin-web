# Favorite Collections from Order History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện “Góc khoái khẩu” để Customer tạo, đổi tên, xóa và chỉnh sửa FavoriteCollection, với Restaurant gợi ý chỉ từ lịch sử Order `completed`.

**Architecture:** `OrderHistoryRepository` tách nguồn lịch sử khỏi UI và dùng `SharedPreferences` trong giai đoạn local. `RestaurantSuggestionService` là logic thuần Java để lọc, nhóm và xếp hạng Restaurant; Favorites UI chỉ nhận `RestaurantSuggestion`. `FavoriteCollectionStore` quản lý collection độc lập với trạng thái trái tim FavoriteRestaurant.

**Tech Stack:** Android Java 11, XML, Navigation Component, ViewModel, RecyclerView, SharedPreferences, Gson, JUnit 4.

## Global Constraints

- Không gọi Supabase, API hoặc phụ thuộc mạng trong tính năng.
- Chỉ Order `completed` được dùng để gợi ý Restaurant.
- Xếp hạng theo số Order giảm dần, sau đó `completedAt` mới nhất.
- Membership collection không tự động thay đổi trạng thái trái tim.
- Tên collection được phép trùng; ID phải duy nhất.
- Tên sau khi trim dài từ 1 đến 60 ký tự.
- Không có lịch sử hợp lệ thì hiển thị empty state và CTA về Trang chủ.
- Local JSON có version, dữ liệu hỏng không làm crash hoặc bị ghi đè âm thầm.
- Vùng chạm tối thiểu 48dp, icon có content description và trạng thái selected hỗ trợ TalkBack.
- Không ghi đè các thay đổi Profile hoặc tài liệu không liên quan trong worktree.

---

## File Structure

- Modify `data/model/Order.java`: thêm `restaurantId`, `restaurantName`, `completedAt` và giữ constructor tương thích.
- Create `data/repository/OrderHistoryRepository.java`: contract lịch sử Order.
- Create `data/local/SharedPreferencesOrderHistoryRepository.java`: persistence local.
- Create `ui/favorites/model/RestaurantSuggestion.java`: projection cho UI.
- Create `ui/favorites/data/RestaurantSuggestionService.java`: ranking thuần Java.
- Modify `ui/favorites/data/FavoriteCollectionStore.java`: save, rename, delete; không seed collection giả.
- Modify `ui/favorites/adapters/FavoriteCollectionAdapter.java`: ô hệ thống Yêu thích, collection, add card và overflow menu.
- Modify `ui/favorites/CollectionRestaurantsFragment.java`: render suggestion/empty state.
- Modify layouts/navigation/resources liên quan: trạng thái và thao tác mới.

---

### Task 1: Extend Order with Restaurant Identity and Completion Time

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/data/model/Order.java`
- Modify: `app/src/main/java/com/example/fooddelivery/data/local/LocalOrderStore.java`
- Test: `app/src/test/java/com/example/fooddelivery/OrderHistoryModelTest.java`

**Interfaces:**
- Produces: `getRestaurantId(): String`, `getRestaurantName(): String`, `getCompletedAt(): long`.

- [ ] **Step 1: Write the failing model test**

```java
@Test public void orderExposesRestaurantHistoryFields() {
    Order order = new Order(1, "restaurant-7", "Guu Chicken", "Cơm gà", "Nhà",
            1, 65000, 7, "completed", 0, 1719550000000L);
    assertEquals("restaurant-7", order.getRestaurantId());
    assertEquals("Guu Chicken", order.getRestaurantName());
    assertEquals(1719550000000L, order.getCompletedAt());
}
```

- [ ] **Step 2: Run RED verification**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*OrderHistoryModelTest"`

Expected: compilation fails because the constructor/getters do not exist.

- [ ] **Step 3: Add fields without breaking current call sites**

```java
public Order(int id, String restaurantId, String restaurantName, String foodName,
        String tableInfo, int quantity, long totalPrice, int timeMinutes,
        String status, int foodImageResId, long completedAt) {
    this.id = id;
    this.restaurantId = restaurantId;
    this.restaurantName = restaurantName;
    this.foodName = foodName;
    this.tableInfo = tableInfo;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
    this.timeMinutes = timeMinutes;
    this.status = status;
    this.foodImageResId = foodImageResId;
    this.completedAt = completedAt;
}
```

Keep the old constructor and delegate with `restaurantId = "unknown"`, empty restaurant name and `completedAt = 0L`. Update `LocalOrderStore.createFromCart` only when Restaurant identity is available; never invent an ID from a food name.

- [ ] **Step 4: Run GREEN verification**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*OrderHistoryModelTest"`

Expected: `BUILD SUCCESSFUL`.

### Task 2: Local Order History Repository

**Files:**
- Create: `app/src/main/java/com/example/fooddelivery/data/repository/OrderHistoryRepository.java`
- Create: `app/src/main/java/com/example/fooddelivery/data/local/SharedPreferencesOrderHistoryRepository.java`
- Test: `app/src/test/java/com/example/fooddelivery/SharedPreferencesOrderHistoryRepositoryTest.java`

**Interfaces:**
- Produces: `List<Order> getCompletedOrders()` and `void save(Order order)`.

- [ ] **Step 1: Define the repository contract**

```java
public interface OrderHistoryRepository {
    List<Order> getCompletedOrders();
    void save(Order order);
}
```

- [ ] **Step 2: Write failing persistence/filter tests**

```java
@Test public void completedOrdersExcludesPendingAndCancelled() {
    repository.save(completed("r1", 100L));
    repository.save(order("r2", "pending", 200L));
    repository.save(order("r3", "cancelled", 300L));
    assertEquals(Collections.singletonList("r1"), ids(repository.getCompletedOrders()));
}
```

Use a package-private constructor accepting `SharedPreferences` so the test uses an in-memory fake without Robolectric.

- [ ] **Step 3: Implement Gson persistence and defensive parsing**

```java
@Override public List<Order> getCompletedOrders() {
    List<Order> all = readAll();
    List<Order> result = new ArrayList<>();
    for (Order order : all) {
        if ("completed".equals(order.getStatus())
                && order.getRestaurantId() != null
                && !"unknown".equals(order.getRestaurantId())) result.add(order);
    }
    return result;
}
```

On malformed JSON return an empty list. `save` upserts by Order ID and writes with `apply()`.

- [ ] **Step 4: Run repository tests**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*SharedPreferencesOrderHistoryRepositoryTest"`

Expected: `BUILD SUCCESSFUL`.

### Task 3: Restaurant Suggestion Ranking

**Files:**
- Create: `app/src/main/java/com/example/fooddelivery/ui/favorites/model/RestaurantSuggestion.java`
- Create: `app/src/main/java/com/example/fooddelivery/ui/favorites/data/RestaurantSuggestionService.java`
- Rename/modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/data/FavoriteRestaurantCatalog.java`
- Test: `app/src/test/java/com/example/fooddelivery/RestaurantSuggestionServiceTest.java`

**Interfaces:**
- Consumes: `List<Order>` and Restaurant display catalog.
- Produces: `List<RestaurantSuggestion> suggest(List<Order> orders)`.

- [ ] **Step 1: Write ranking tests**

```java
@Test public void ranksByFrequencyThenMostRecentCompletion() {
    List<Order> orders = Arrays.asList(
            completed("a", 100L), completed("b", 400L),
            completed("a", 200L), completed("c", 500L));
    assertEquals(Arrays.asList("a", "c", "b"), ids(service.suggest(orders)));
}

@Test public void ignoresNonCompletedAndDeduplicatesRestaurants() {
    List<Order> orders = Arrays.asList(completed("a", 100L), completed("a", 200L),
            order("b", "cancelled", 300L));
    assertEquals(Collections.singletonList("a"), ids(service.suggest(orders)));
}
```

- [ ] **Step 2: Run RED verification**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*RestaurantSuggestionServiceTest"`

Expected: compilation fails because the service does not exist.

- [ ] **Step 3: Implement grouping and comparator**

```java
suggestions.sort(Comparator
        .comparingInt(RestaurantSuggestion::getCompletedOrderCount).reversed()
        .thenComparing(Comparator.comparingLong(
                RestaurantSuggestion::getLatestCompletedAt).reversed()));
```

Skip Orders whose Restaurant cannot be resolved in the display catalog. Rename the current `FavoriteRestaurant` display DTO to `RestaurantSuggestion` so it no longer conflicts with the glossary term FavoriteRestaurant.

- [ ] **Step 4: Run GREEN verification**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*RestaurantSuggestionServiceTest"`

Expected: `BUILD SUCCESSFUL`.

### Task 4: Collection Store Rename/Delete Semantics

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/data/FavoriteCollectionStore.java`
- Test: `app/src/test/java/com/example/fooddelivery/FavoriteCollectionStoreTest.java`

**Interfaces:**
- Produces: `save(FavoriteCollection)`, `rename(String id, String name): boolean`, `delete(String id): boolean`.

- [ ] **Step 1: Write failing behavior tests**

```java
@Test public void duplicateNamesAreAllowedBecauseIdsDiffer() {
    store.save(collection("1", "Bữa sáng"));
    store.save(collection("2", "Bữa sáng"));
    assertEquals(2, store.getAll().size());
}

@Test public void deleteRemovesOnlyMatchingCollection() {
    store.save(collection("1", "Một")); store.save(collection("2", "Hai"));
    assertTrue(store.delete("1"));
    assertEquals(Collections.singletonList("2"), ids(store.getAll()));
}
```

- [ ] **Step 2: Remove the fake default collection**

`getAll()` returns an empty list when preferences are empty/corrupt. The system “Yêu thích” tile is UI state, not a persisted FavoriteCollection.

- [ ] **Step 3: Implement rename/delete by ID**

```java
public boolean delete(String id) {
    List<FavoriteCollection> values = getAll();
    boolean changed = values.removeIf(item -> item.getId().equals(id));
    if (changed) write(values);
    return changed;
}
```

`rename` trims the name, rejects blank values, preserves the ID and Restaurant IDs, and permits another collection to have the same name.

- [ ] **Step 4: Run store tests**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*FavoriteCollectionStoreTest"`

Expected: `BUILD SUCCESSFUL`.

### Task 5: Suggestion and Empty-State UI

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/CollectionRestaurantsFragment.java`
- Rename/modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/adapters/FavoriteRestaurantAdapter.java`
- Modify: `app/src/main/res/layout/fragment_collection_restaurants.xml`
- Modify: `app/src/main/res/layout/item_favorite_restaurant.xml`
- Create: `app/src/main/res/layout/view_empty_order_history.xml`
- Modify: `app/src/main/res/navigation/nav_favorites.xml`

**Interfaces:**
- Consumes: `OrderHistoryRepository.getCompletedOrders()` and `RestaurantSuggestionService.suggest()`.
- Produces: ranked Restaurant rows or empty state.

- [ ] **Step 1: Replace static catalog listing with repository data**

```java
OrderHistoryRepository history = new SharedPreferencesOrderHistoryRepository(requireContext());
List<RestaurantSuggestion> suggestions = suggestionService.suggest(history.getCompletedOrders());
binding.restaurantsList.setVisibility(suggestions.isEmpty() ? View.GONE : View.VISIBLE);
binding.emptyHistory.getRoot().setVisibility(suggestions.isEmpty() ? View.VISIBLE : View.GONE);
```

- [ ] **Step 2: Implement empty state**

The layout contains “Bạn chưa có quán từng đặt”, supporting copy, and a 48dp+ “Khám phá quán ăn” CTA. CTA pops to `favoritesFragment` then selects `R.id.nav_home` through `MainActivity` or a navigation result contract; do not create mock Order data.

- [ ] **Step 3: Keep selection independent from heart state**

The adapter only calls `draft.toggleRestaurant(id)`. It must not call any FavoriteRestaurant repository or update heart icons.

- [ ] **Step 4: Build resources/navigation**

Run: `.\gradlew.bat :app:assembleDebug --console=plain`

Expected: `BUILD SUCCESSFUL`.

### Task 6: Collection Grid Menus and Detail Editing

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/adapters/FavoriteCollectionAdapter.java`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/FavoritesFragment.java`
- Modify: `app/src/main/res/layout/item_favorite_collection.xml`
- Create: `app/src/main/res/menu/favorite_collection_actions.xml`
- Create: `app/src/main/res/layout/dialog_rename_favorite_collection.xml`

**Interfaces:**
- Produces callbacks: `onOpen(id)`, `onRename(id)`, `onDelete(id)`, `onAdd()`.

- [ ] **Step 1: Add the system Favorites tile and overflow action**

Use separate adapter view types: `TYPE_SYSTEM_FAVORITES`, `TYPE_COLLECTION`, `TYPE_ADD`. The system tile never receives rename/delete actions. Each user collection has a 48dp overflow touch target.

- [ ] **Step 2: Implement rename dialog**

Pre-fill the current name. Disable save for blank text. On save call `store.rename(id, value)` and refresh the adapter; duplicate names remain valid.

- [ ] **Step 3: Implement confirmed deletion**

```java
new MaterialAlertDialogBuilder(requireContext())
    .setTitle("Xóa bộ sưu tập?")
    .setMessage("Các quán và lịch sử đặt món vẫn được giữ nguyên.")
    .setNegativeButton("Hủy", null)
    .setPositiveButton("Xóa", (dialog, which) -> {
        store.delete(collectionId);
        renderCollections();
    }).show();
```

- [ ] **Step 4: Verify open/edit flow**

Tap a collection, load it into `FavoriteCollectionDraftViewModel`, open `CollectionRestaurantsFragment`, modify selection, complete, and verify the same ID is updated rather than appended.

- [ ] **Step 5: Build the complete UI**

Run: `.\gradlew.bat :app:assembleDebug --console=plain`

Expected: `BUILD SUCCESSFUL`.

### Task 7: Production Hardening

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/FavoriteCollectionDraftViewModel.java`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/data/FavoriteCollectionStore.java`
- Modify: `app/src/main/java/com/example/fooddelivery/data/local/SharedPreferencesOrderHistoryRepository.java`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/CollectionNameFragment.java`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/favorites/CollectionRestaurantsFragment.java`
- Test: `app/src/test/java/com/example/fooddelivery/FavoriteCollectionValidationTest.java`

**Interfaces:**
- Produces: `isNameValid()` enforcing 1–60 trimmed characters and versioned local payloads.

- [ ] **Step 1: Write validation boundary tests**

```java
@Test public void nameMustBeBetweenOneAndSixtyTrimmedCharacters() {
    viewModel.setName(" "); assertFalse(viewModel.isNameValid());
    viewModel.setName(repeat("a", 60)); assertTrue(viewModel.isNameValid());
    viewModel.setName(repeat("a", 61)); assertFalse(viewModel.isNameValid());
}
```

- [ ] **Step 2: Implement one validation source**

```java
public boolean isNameValid() {
    int length = name.trim().length();
    return length >= 1 && length <= 60;
}
```

`CollectionNameFragment` derives button state and error copy from this method; it does not duplicate numeric rules.

- [ ] **Step 3: Version local JSON envelopes**

```java
final class StoredCollections {
    int version = 1;
    List<FavoriteCollection> collections = new ArrayList<>();
}
```

Read legacy array JSON as version 0 and migrate in memory. Unknown versions and malformed JSON return an explicit empty/error result; do not overwrite preferences until the next successful user save.

- [ ] **Step 4: Prevent duplicate actions**

Disable complete/save/delete controls immediately on click, perform one store operation, and only re-enable on failure. Navigation occurs once after successful save.

- [ ] **Step 5: Accessibility and restoration pass**

Set content descriptions for back, clear, overflow and collection images. Keep all actionable views at least 48dp. Set `itemView.setSelected(selected)` plus a state description for Restaurant rows. Preserve draft in ViewModel and RecyclerView state through normal configuration recreation.

- [ ] **Step 6: Run hardening tests and build**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*FavoriteCollectionValidationTest" :app:assembleDebug --console=plain`

Expected: focused tests pass and `BUILD SUCCESSFUL`.

### Task 8: Full Verification

**Files:**
- Test only; change source only for a reproduced defect.

- [ ] **Step 1: Run focused tests**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests "*OrderHistoryModelTest" --tests "*SharedPreferencesOrderHistoryRepositoryTest" --tests "*RestaurantSuggestionServiceTest" --tests "*FavoriteCollectionStoreTest"`

Expected: all focused tests pass.

- [ ] **Step 2: Run debug build**

Run: `.\gradlew.bat :app:assembleDebug --console=plain`

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: Manual acceptance**

1. With no completed Orders, verify the empty state and Home CTA.
2. Persist completed/cancelled/pending Orders; verify only completed Restaurant entries appear.
3. Verify frequency ranking, then latest-completion tie-break.
4. Create two collections with the same name and confirm both appear.
5. Open one, add/remove Restaurant, complete and verify no duplicate collection.
6. Rename and delete with confirmation; verify Restaurant/Order history remains.
7. Restart the app and verify Orders and collections persist.
8. Verify collection actions never alter heart state.
9. Verify 60 characters accepted, 61 rejected without losing input.
10. Verify rapid double-taps create/update only one collection.
11. Verify content descriptions and 48dp touch targets with TalkBack/layout inspection.

## Self-Review Result

- Spec coverage: Order identity, repository seam, completed-only filtering, ranking, empty state, duplicate names, edit, rename, confirmed delete, heart independence, validation, versioning, duplicate-action prevention and accessibility each map to a task.
- Placeholder scan: no deferred implementation markers remain.
- Type consistency: Tasks 3 and 5 consistently use `RestaurantSuggestion`; Tasks 2 and 5 use `OrderHistoryRepository`.
