# PRD: Domain Model Refactor — Cart, Order, Restaurant, DeliveryAddress

> Label: `ready-for-agent`
> Status: Pending publish to GitHub Issues

## Problem Statement

The current domain model of the food-delivery Customer app is misaligned with the actual business domain established during the grill-with-docs session. Specifically:

- `Order` contains a single `foodName` string, but an Order should hold multiple OrderLines (multiple Món with quantities).
- There is no `Cart` entity — the existing `Checkout.java` is a stub Activity with no data layer, no ViewModel, and no connection to any backend.
- There are no models for `CartItem`, `OrderLine`, `DeliveryAddress`, or `Restaurant`.
- `Order` status is limited to three strings (`pending`, `completed`, `cancelled`), missing the full lifecycle required for a delivery app.
- `FoodCategory` serves as a Món filter but is not named consistently with the domain; a separate `Cuisine` concept for Restaurant classification does not exist yet.

As a result, Customer cannot place a real multi-item order, cannot save delivery addresses, and the checkout flow is entirely disconnected from the backend.

## Solution

Refactor and extend the data layer models and ViewModels to reflect the domain model captured in CONTEXT.md. Introduce the missing entities (`Cart`, `CartItem`, `OrderLine`, `DeliveryAddress`, `Restaurant`, `Cuisine`, `DishCategory`) and replace the stub `Checkout` flow with a properly wired MVVM checkout that creates a real Order on the backend.

## User Stories

1. As a Customer, I want to add multiple Món to my Cart, so that I can order several items in a single Order.
2. As a Customer, I want my Cart to be persisted, so that I can resume my order after closing the app or switching devices.
3. As a Customer, I want to see the list of CartItems in my Cart with quantities and prices, so that I can review my order before checkout.
4. As a Customer, I want to change the quantity of a CartItem, so that I can adjust how many of a Món I want.
5. As a Customer, I want to remove a CartItem from my Cart, so that I can correct mistakes before placing the Order.
6. As a Customer, I want to save multiple DeliveryAddresses (e.g. 'Nhà', 'Cơ quan'), so that I can reuse them when placing future Orders without re-entering the full address.
7. As a Customer, I want to mark one DeliveryAddress as default, so that it is pre-selected when I go to checkout.
8. As a Customer, I want to select a DeliveryAddress at checkout, so that I can deliver to a different address than my default when needed.
9. As a Customer, I want to choose a PaymentMethod at checkout (COD, MoMo, ZaloPay, bank card), so that I can pay in the way that suits me.
10. As a Customer, I want to confirm my Order and see it transition to `pending`, so that I know my order has been sent to the Restaurant.
11. As a Customer, I want to cancel my Order while it is `pending`, so that I can change my mind before the Restaurant accepts.
12. As a Customer, I want to track my Order status through the full lifecycle (pending → confirmed → preparing → ready_for_pickup → delivering → completed), so that I know what is happening with my food at all times.
13. As a Customer, I want to see Order history with all OrderLines and the final total, so that I can review past purchases.
14. As a Customer, I want to reorder a past Order (add its OrderLines back to Cart), so that I can quickly repeat a favourite meal.
15. As a Customer, I want to browse Restaurants filtered by Cuisine (e.g. 'Trà sữa', 'Quán ăn', 'Sushi'), so that I can discover new places by food type.
16. As a Customer, I want to filter Món by DishCategory (e.g. 'Cơm', 'Phở', 'Đồ uống') within a Restaurant menu, so that I can find the type of food I want quickly.
17. As a Customer, I want to see Restaurant information (name, address, Cuisine) on the Món detail screen, so that I know which Restaurant I am ordering from.

## Implementation Decisions

- **Domain vocabulary**: All code, variable names, and comments must use the terms defined in CONTEXT.md — Món, DishCategory, Cuisine, Customer, Cart, CartItem, Order, OrderLine, DeliveryAddress, Restaurant, PaymentMethod.

- **New models required**:
  - `Cart`: id, customerId, list of CartItems, createdAt
  - `CartItem`: id, cartId, Món reference (foodId), quantity
  - `OrderLine`: id, orderId, Món snapshot (foodId, name, price at time of order), quantity
  - `Order` (refactored): id, customerId, restaurantId, list of OrderLines, deliveryAddressId, paymentMethod (enum: COD/MOMO/ZALOPAY/BANK_CARD), status (enum: pending/confirmed/preparing/ready_for_pickup/delivering/completed/cancelled), cancelledBy (CUSTOMER/RESTAURANT/SYSTEM), createdAt
  - `DeliveryAddress`: id, customerId, label ('Nhà'/'Cơ quan'/custom), fullAddress, latitude, longitude, isDefault
  - `Restaurant`: id, name, address, cuisineId, imageUrl
  - `DishCategory`: id, name, slug, iconUrl (rename from FoodCategory — code rename optional, glossary rename mandatory)
  - `Cuisine`: id, name, slug, iconUrl (new entity for Restaurant classification)

- **Cancellation rules** (enforced at ViewModel/Repository level):
  - CUSTOMER may cancel only when status == `pending`
  - RESTAURANT may cancel when status == `confirmed` or `preparing`
  - SYSTEM auto-cancels at `pending` on timeout (1–2 min)
  - No cancellation is allowed at `ready_for_pickup`, `delivering`, or `completed`

- **Cart persistence**: Cart is stored on the backend (Supabase). The app syncs Cart on login and on app resume. Local optimistic updates are applied immediately; conflicts resolve to server state.

- **Checkout flow** (replacing the current stub `Checkout.java`):
  - Migrate `Checkout` from a standalone Activity to a Fragment within the Navigation graph
  - Wire to a `CheckoutViewModel` backed by a `CartRepository` and `OrderRepository`
  - On confirm: POST to backend to create Order from current Cart, then clear Cart and navigate to Order tracking screen

- **Architecture**: Continue the existing MVVM pattern. All business logic lives in ViewModels; all network calls go through Repositories. No business logic in Fragments or Activities.

- **Backend**: Supabase (existing). New tables needed: `carts`, `cart_items`, `order_lines`, `delivery_addresses`, `restaurants`, `cuisines`. Rename or alias `food_categories` to reflect DishCategory role.

## Testing Decisions

- The primary test seam is the **ViewModel** — test ViewModels in isolation with faked Repositories.
- A good test asserts on observable state (LiveData emissions) in response to Repository outputs; it does not assert on which Repository methods were called (implementation detail).
- Priority modules to test: `CheckoutViewModel`, `CartViewModel`, `OrderViewModel`.
- No existing test prior art in the codebase — new test infrastructure (JUnit 4 + MockK or Mockito) must be set up as part of this work.

## Out of Scope

- Seller app / Restaurant-facing order management (separate app)
- Shipper app / real-time GPS tracking implementation
- Payment gateway integration (PaymentMethod enum introduced; SDK wiring is follow-up)
- Push notifications for Order status changes
- Refund / dispute flow
- Rating and review of Món or Restaurant

## Further Notes

- The current `Checkout.java` has encoding corruption in comments (mojibake). Clean up when migrating to Fragment.
- `FoodItem.id` is currently `int`; review whether `long` or `String` (UUID) is needed to match Supabase row IDs before schema changes.
- Run `/to-issues` on this PRD to break it into independently-grabbable issues before starting implementation.
