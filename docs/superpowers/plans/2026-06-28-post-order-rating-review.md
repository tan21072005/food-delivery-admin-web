# Rating/review sau Order completed Kế hoạch implementation

> **Danh cho worker agentic:** SUB-SKILL BAT BUOC: Dung superpowers:subagent-driven-development (khuyen nghi) hoac superpowers:executing-plans de trien khai plan nay theo tung task. Cac buoc dung co phap checkbox (`- [ ]`) de theo doi tien do.

**Mục tiêu:** Xay luong review sau Order an toan, chi Customer authenticated duoc review Order completed cua chinh ho dung mot lan.

**Kiến trúc:** Giu Android Java + MVVM + Retrofit. Them ReviewRepository/ViewModel quanh Supabase RPC, tai su dung UI review Order hien co, va de Supabase lam source of truth cho eligibility va duplicate prevention.

**Tech stack:** Android Java, AndroidX Fragment/ViewModel/LiveData, Retrofit/Gson, Supabase REST/RPC, PostgreSQL/RLS.

## Rang buoc chung

- Nguon plan: `docs/prd/2026-06-28-post-order-rating-review.md`.
- Only completed Orders can be reviewed.
- A Customer can create at most one review per Order.
- Backend/RPC must derive Customer identity from `auth.uid()`.
- Client must not trust or send authoritative `user_id`, `customer_id`, `restaurant_id`, `status`, or `is_reviewed`.
- RLS/security must be part of implementation before production/demo security claims.
- Driver review, review photos, moderation, edit/delete, and Seller reply are out of first release.
- Khong lam regress behavior Ordering MVP Cart, Checkout hoac Order tracking.

---

## Cau truc file

- Tao: `app/src/main/java/com/example/fooddelivery/data/model/OrderReview.java`
  - Review DTO returned by Supabase.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/OrderReviewState.java`
  - Eligibility/read state for the review screen.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/SubmitOrderReviewRequest.java`
  - RPC request body containing only review inputs.
- Sua: `app/src/main/java/com/example/fooddelivery/data/model/Order.java`
  - Transition from local `isReviewed` flag to server `is_reviewed` when Order MVP repository is ready.
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
  - Them endpoint RPC review.
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/ReviewRepository.java`
  - Own review state/read/submit calls.
- Tao: `app/src/main/java/com/example/fooddelivery/ui/order/OrderReviewViewModel.java`
  - Loads eligibility, validates rating, submits review, exposes UI state.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/OrderReviewFragment.java`
  - Thay write `LocalOrderStore` bang ViewModel.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/OrderListFragment.java`
  - Dam bao navigation review truyen `order_id` that.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/adapters/OrderAdapter.java`
  - Giu behavior CTA duoc dieu khien boi `isReviewed` va status completed.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/ReviewsFragment.java`
  - Thay Restaurant reviews chi mock bang data repository khi backend ton tai.
- Tai lieu SQL hoac migration de xuat do worker trien khai so huu:
  - `docs/sql_order_reviews.sql` or project migration path if one exists.

---

### Task 1: Them model domain review

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/OrderReview.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/OrderReviewState.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/SubmitOrderReviewRequest.java`

**Interface:**
- Tao ra:
  - `OrderReview`
  - `OrderReviewState`
  - `SubmitOrderReviewRequest`

- [ ] **Buoc 1: Them DTO `OrderReview`**

```java
package com.example.fooddelivery.data.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class OrderReview {
    @SerializedName("id")
    private long id;
    @SerializedName("order_id")
    private long orderId;
    @SerializedName("restaurant_id")
    private long restaurantId;
    @SerializedName("restaurant_rating")
    private int restaurantRating;
    @SerializedName("review_text")
    private String reviewText;
    @SerializedName("food_feedback")
    private String foodFeedback;
    @SerializedName("food_tags")
    private List<String> foodTags;
    @SerializedName("created_at")
    private String createdAt;

    public long getId() { return id; }
    public long getOrderId() { return orderId; }
    public long getRestaurantId() { return restaurantId; }
    public int getRestaurantRating() { return restaurantRating; }
    public String getReviewText() { return reviewText; }
    public String getFoodFeedback() { return foodFeedback; }
    public List<String> getFoodTags() { return foodTags; }
    public String getCreatedAt() { return createdAt; }
}
```

- [ ] **Buoc 2: Them DTO `OrderReviewState`**

```java
package com.example.fooddelivery.data.model;

import com.google.gson.annotations.SerializedName;

public class OrderReviewState {
    @SerializedName("order_id")
    private long orderId;
    @SerializedName("status")
    private String status;
    @SerializedName("is_eligible")
    private boolean eligible;
    @SerializedName("is_reviewed")
    private boolean reviewed;
    @SerializedName("restaurant_name")
    private String restaurantName;
    @SerializedName("item_name")
    private String itemName;
    @SerializedName("image_url")
    private String imageUrl;
    @SerializedName("review")
    private OrderReview review;

    public long getOrderId() { return orderId; }
    public String getStatus() { return status; }
    public boolean isEligible() { return eligible; }
    public boolean isReviewed() { return reviewed; }
    public String getRestaurantName() { return restaurantName; }
    public String getItemName() { return itemName; }
    public String getImageUrl() { return imageUrl; }
    public OrderReview getReview() { return review; }
}
```

- [ ] **Buoc 3: Them request body**

```java
package com.example.fooddelivery.data.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class SubmitOrderReviewRequest {
    @SerializedName("p_order_id")
    public final long orderId;
    @SerializedName("p_restaurant_rating")
    public final int restaurantRating;
    @SerializedName("p_review_text")
    public final String reviewText;
    @SerializedName("p_food_feedback")
    public final String foodFeedback;
    @SerializedName("p_food_tags")
    public final List<String> foodTags;

    public SubmitOrderReviewRequest(long orderId, int restaurantRating, String reviewText,
                                    String foodFeedback, List<String> foodTags) {
        this.orderId = orderId;
        this.restaurantRating = restaurantRating;
        this.reviewText = reviewText;
        this.foodFeedback = foodFeedback;
        this.foodTags = foodTags;
    }
}
```

- [ ] **Buoc 4: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: new models compile.

---

### Task 2: Thêm contract bảo mật review trên Supabase

**File:**
- Tao: `docs/sql_order_reviews.sql` or the repo's chosen migration location

**Interface:**
- Tao ra:
  - `order_reviews` table with `UNIQUE(order_id)`
  - `submit_order_review(...)`
  - `get_order_review_state(p_order_id BIGINT)`
  - `get_restaurant_reviews(p_restaurant_id BIGINT)`

- [ ] **Buoc 1: Tao draft table**

```sql
CREATE TABLE IF NOT EXISTS public.order_reviews (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  restaurant_rating SMALLINT NOT NULL CHECK (restaurant_rating BETWEEN 1 AND 5),
  review_text TEXT,
  food_feedback TEXT CHECK (food_feedback IS NULL OR food_feedback IN ('positive', 'negative')),
  food_tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_reviews_restaurant_created
  ON public.order_reviews(restaurant_id, created_at DESC)
  WHERE deleted_at IS NULL;
```

- [ ] **Buoc 2: Tao RPC submit**

```sql
CREATE OR REPLACE FUNCTION public.submit_order_review(
  p_order_id BIGINT,
  p_restaurant_rating SMALLINT,
  p_review_text TEXT DEFAULT NULL,
  p_food_feedback TEXT DEFAULT NULL,
  p_food_tags TEXT[] DEFAULT NULL
) RETURNS public.order_reviews AS $$
DECLARE
  v_user_id BIGINT;
  v_order public.orders%ROWTYPE;
  v_review public.order_reviews%ROWTYPE;
BEGIN
  SELECT id INTO v_user_id FROM public.users WHERE auth_uid = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status::TEXT <> 'completed' THEN
    RAISE EXCEPTION 'Only completed orders can be reviewed';
  END IF;

  INSERT INTO public.order_reviews (
    order_id, user_id, restaurant_id, restaurant_rating,
    review_text, food_feedback, food_tags
  ) VALUES (
    p_order_id, v_user_id, v_order.restaurant_id, p_restaurant_rating,
    NULLIF(TRIM(p_review_text), ''), p_food_feedback, p_food_tags
  )
  RETURNING * INTO v_review;

  UPDATE public.restaurants r
  SET avg_rating = stats.avg_rating,
      total_reviews = stats.total_reviews,
      updated_at = NOW()
  FROM (
    SELECT restaurant_id,
           ROUND(AVG(restaurant_rating)::NUMERIC, 2) AS avg_rating,
           COUNT(*)::INT AS total_reviews
    FROM public.order_reviews
    WHERE restaurant_id = v_order.restaurant_id AND deleted_at IS NULL
    GROUP BY restaurant_id
  ) stats
  WHERE r.id = stats.restaurant_id;

  RETURN v_review;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Order already reviewed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Buoc 3: Them RLS va grants**

```sql
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can read own order reviews"
ON public.order_reviews FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()));

CREATE POLICY "Public can read displayable restaurant reviews"
ON public.order_reviews FOR SELECT
USING (deleted_at IS NULL);

REVOKE ALL ON public.order_reviews FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_order_review(BIGINT, SMALLINT, TEXT, TEXT, TEXT[]) TO authenticated;
```

- [ ] **Buoc 4: SQL verification**

Chay the SQL in a disposable Supabase project or local database, not production.

Ky vong:
- completed owner Order inserts one review
- second insert for same Order fails
- non-owner Order fails
- non-completed Order fails

---

### Task 3: Them API va Repository

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/ReviewRepository.java`

**Interface:**
- Tao ra:
  - `Call<OrderReviewState> getOrderReviewState(long orderId)`
  - `Call<OrderReview> submitOrderReview(...)`
  - `Call<List<OrderReview>> getRestaurantReviews(long restaurantId)`

- [ ] **Buoc 1: Them method Retrofit**

```java
@POST("rest/v1/rpc/get_order_review_state")
Call<OrderReviewState> getOrderReviewState(@Body java.util.Map<String, Long> body);

@POST("rest/v1/rpc/submit_order_review")
Call<OrderReview> submitOrderReview(@Body SubmitOrderReviewRequest request);

@GET("rest/v1/rpc/get_restaurant_reviews")
Call<List<OrderReview>> getRestaurantReviews(@Query("p_restaurant_id") long restaurantId);
```

- [ ] **Buoc 2: Them repository**

```java
package com.example.fooddelivery.data.repository;

import android.content.Context;
import com.example.fooddelivery.data.model.OrderReview;
import com.example.fooddelivery.data.model.OrderReviewState;
import com.example.fooddelivery.data.model.SubmitOrderReviewRequest;
import com.example.fooddelivery.data.remote.SupabaseClient;
import com.example.fooddelivery.data.remote.apis.ApiService;
import java.util.Collections;
import java.util.List;
import retrofit2.Call;

public class ReviewRepository {
    private final ApiService api;

    public ReviewRepository(Context context) {
        api = SupabaseClient.getInstance(context).create(ApiService.class);
    }

    public Call<OrderReviewState> getOrderReviewState(long orderId) {
        return api.getOrderReviewState(Collections.singletonMap("p_order_id", orderId));
    }

    public Call<OrderReview> submitOrderReview(long orderId, int rating, String text,
                                               String foodFeedback, List<String> tags) {
        return api.submitOrderReview(new SubmitOrderReviewRequest(orderId, rating, text, foodFeedback, tags));
    }

    public Call<List<OrderReview>> getRestaurantReviews(long restaurantId) {
        return api.getRestaurantReviews(restaurantId);
    }
}
```

- [ ] **Buoc 3: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: repository and API compile.

---

### Task 4: Them `OrderReviewViewModel`

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/ui/order/OrderReviewViewModel.java`

**Interface:**
- Tieu thu: `ReviewRepository`
- Tao ra:
  - `LiveData<Boolean> isLoading()`
  - `LiveData<OrderReviewState> reviewState()`
  - `LiveData<String> errorMessage()`
  - `LiveData<OrderReview> submitSuccess()`
  - `void load(long orderId)`
  - `void submit(long orderId, int rating, String text, String foodFeedback, List<String> tags)`

- [ ] **Buoc 1: Implement ViewModel**

```java
package com.example.fooddelivery.ui.order;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.example.fooddelivery.data.model.OrderReview;
import com.example.fooddelivery.data.model.OrderReviewState;
import com.example.fooddelivery.data.repository.ReviewRepository;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrderReviewViewModel extends AndroidViewModel {
    private final ReviewRepository repository;
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<OrderReviewState> state = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<OrderReview> success = new MutableLiveData<>();

    public OrderReviewViewModel(@NonNull Application application) {
        super(application);
        repository = new ReviewRepository(application);
    }

    public LiveData<Boolean> isLoading() { return loading; }
    public LiveData<OrderReviewState> reviewState() { return state; }
    public LiveData<String> errorMessage() { return error; }
    public LiveData<OrderReview> submitSuccess() { return success; }

    public void load(long orderId) {
        loading.setValue(true);
        repository.getOrderReviewState(orderId).enqueue(new Callback<OrderReviewState>() {
            @Override public void onResponse(Call<OrderReviewState> call, Response<OrderReviewState> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    state.setValue(response.body());
                } else {
                    error.setValue("Khong tai duoc trang thai danh gia: " + response.code());
                }
            }

            @Override public void onFailure(Call<OrderReviewState> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Loi ket noi: " + t.getMessage());
            }
        });
    }

    public void submit(long orderId, int rating, String text, String foodFeedback, List<String> tags) {
        if (rating < 1 || rating > 5) {
            error.setValue("Vui long danh gia nha hang tu 1 den 5 sao.");
            return;
        }
        loading.setValue(true);
        repository.submitOrderReview(orderId, rating, text, foodFeedback, tags).enqueue(new Callback<OrderReview>() {
            @Override public void onResponse(Call<OrderReview> call, Response<OrderReview> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    success.setValue(response.body());
                    load(orderId);
                } else if (response.code() == 409) {
                    error.setValue("Don hang nay da duoc danh gia.");
                    load(orderId);
                } else {
                    error.setValue("Khong gui duoc danh gia: " + response.code());
                }
            }

            @Override public void onFailure(Call<OrderReview> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Loi ket noi: " + t.getMessage());
            }
        });
    }
}
```

- [ ] **Buoc 2: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: ViewModel compiles.

---

### Task 5: Noi man hinh review hien co

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/OrderReviewFragment.java`
- Chi sua neu can: `app/src/main/res/layout/order_fragment_review.xml`

**Interface:**
- Tieu thu: `OrderReviewViewModel`
- Tao ra: server-backed submit and read-only already-reviewed behavior.

- [ ] **Buoc 1: Thay lookup `LocalOrderStore`**

Use:

```java
viewModel = new ViewModelProvider(this).get(OrderReviewViewModel.class);
orderId = getArguments() != null ? getArguments().getLong("order_id", -1L) : -1L;
if (orderId <= 0) {
    Toast.makeText(requireContext(), "Khong tim thay don hang.", Toast.LENGTH_SHORT).show();
    Navigation.findNavController(view).popBackStack();
    return;
}
viewModel.load(orderId);
```

- [ ] **Buoc 2: Observe state**

Ky vong behavior:
- `!state.isEligible()` shows disabled submit and message "Chi don da hoan thanh moi co the danh gia."
- `state.isReviewed()` fills hien co review and disables inputs, or shows read-only detail.
- unreviewed completed Order enables submit.

- [ ] **Buoc 3: Submit qua ViewModel**

Thay `LocalOrderStore.markAsReviewed(orderId)` bang:

```java
viewModel.submit(orderId, resRating, getRestaurantReviewText(), getFoodFeedbackValue(), getSelectedFoodTags());
```

- [ ] **Buoc 4: Success result**

On success:
- show hien co success dialog
- pop back to Order list
- ensure Order list refreshes from repository in `onResume`

- [ ] **Buoc 5: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: Review screen compiles without `LocalOrderStore` writes.

---

### Task 6: Cap nhat diem vao lich su Order completed

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/OrderListFragment.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/OrderDetailFragment.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/order/adapters/OrderAdapter.java`

**Interface:**
- Tieu thu: real Order IDs and `isReviewed`
- Tao ra: correct navigation and CTA visibility.

- [ ] **Buoc 1: Pass `order_id` from detail**

`OrderDetailFragment` must receive and forward the da chon Order ID:

```java
Bundle args = new Bundle();
args.putLong("order_id", orderId);
navController.navigate(R.id.action_orderDetailFragment_to_orderReviewFragment, args);
```

- [ ] **Buoc 2: Giu CTA chi cho completed**

Dam bao CTA review chi xuat hien trong card view type completed. Khong them vao layout processing/cancelled.

- [ ] **Buoc 3: Refresh after review**

When returning to completed history, call the Order repository reload method introduced by Ordering MVP. Until that exists, keep `loadOrders()` as a transition fallback but mark the mock branch for deletion.

- [ ] **Buoc 4: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: navigation compiles and no mock-only review write remains.

---

### Task 7: Thay du lieu mock Restaurant reviews

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/ReviewsFragment.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/model/ReviewItem.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/adapters/ReviewAdapter.java`

**Interface:**
- Tieu thu: `ReviewRepository.getRestaurantReviews(restaurantId)`
- Tao ra: real Restaurant review list with hien co filters.

- [ ] **Buoc 1: Map backend reviews to UI model**

Them mapper:

```java
private ReviewItem toReviewItem(OrderReview review) {
    return new ReviewItem(
            "K",
            0xFF4CAF50,
            "Khach hang",
            review.getRestaurantRating(),
            review.getCreatedAt(),
            review.getReviewText(),
            review.getFoodTags() != null ? review.getFoodTags().toArray(new String[0]) : null,
            false
    );
}
```

- [ ] **Buoc 2: Tai theo argument `restaurant_id`**

Use `getArguments().getLong("restaurant_id", -1L)` and call repository. If `restaurant_id <= 0`, show empty state.

- [ ] **Buoc 3: Preserve filters**

Apply hien co star/photo filters to the loaded list. Photo filter should return empty until photos are implemented.

- [ ] **Buoc 4: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: Restaurant reviews compile and no longer depend on `getMockReviews()` for real paths.

---

### Task 8: Tests And Kiem chung

**File:**
- Tao hoac sua: `app/src/test/java/com/example/fooddelivery/OrderReviewViewModelTest.java`
- Optional SQL verification notes: `docs/study_notes/viva/2026-06-28-post-order-rating-review-viva.md`

**Interface:**
- Tieu thu: fake `ReviewRepository` or test seam introduced for ViewModel.

- [ ] **Buoc 1: ViewModel tests**

Cover:

```text
rating 0 rejects before API call
rating 6 rejects before API call
completed unreviewed state enables submit
already reviewed state disables submit
duplicate submit response reloads state
successful submit emits success and reloads state
```

- [ ] **Buoc 2: SQL/RPC manual tests**

Dung DB disposable va verify:

```text
owner + completed Order -> insert succeeds
owner + pending Order -> rejected
other Customer Order -> rejected
second review same Order -> rejected by unique constraint
direct table insert as authenticated role -> rejected
```

- [ ] **Buoc 3: Chay unit tests**

Chay: `.\gradlew.bat :app:testDebugUnitTest`

Ky vong: all unit tests pass.

- [ ] **Buoc 4: Chay compile/build**

Chay: `.\gradlew.bat :app:assembleDebug`

Ky vong: build succeeds.

- [ ] **Buoc 5: MVP demo rehearsal**

Luong thu cong:

```text
1. Tao/tim mot Customer Order trong Supabase.
2. Mark status completed using the agreed demo mechanism.
3. Mo lich su Order completed.
4. Tap Danh gia don hang.
5. Submit review Restaurant 5 sao.
6. Quay lai lich su completed va confirm Xem danh gia.
7. Mo Restaurant reviews va confirm review vua submit xuat hien.
```

---

## Tu ra soat

- Spec coverage: Plan bao phu eligibility completed-only, duplicate prevention, RLS/security, UI, backend, mock transition va MVP demo.
- Placeholder scan: Khong con instruction placeholder.
- Type consistency: Ten Model, repository, ViewModel va UI method duoc dinh nghia truoc khi su dung.



