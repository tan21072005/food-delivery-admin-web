# Delivery Address Flow Design

## Goal

Build the DeliveryAddress flow so the Home screen behaves like a real food delivery app: the Customer taps the address pill below "Giao den", chooses or creates a DeliveryAddress, and returns with the selected delivery location updated.

## Entry Points

### Home

The tappable target is the address pill/card below the "Giao den" label:

`Giao den`
`[KTX Dai hoc Xay dung, 72 Tran ... v]`

Tapping this pill opens the delivery address picker. The "Giao den" text itself is only a label.

### Profile

The Profile entry point opens the same saved-address area for address management, but the return behavior is different from Home.

## Recommended Flow

### From Home

1. Customer taps the address pill under "Giao den".
2. App opens "Dia chi giao hang".
3. Customer selects an existing DeliveryAddress, edits one, or adds a new one.
4. After Save, the saved DeliveryAddress becomes the current delivery address.
5. App returns to Home.
6. The Home address pill updates to the selected/saved DeliveryAddress.

### From Profile

1. Customer opens address management from Profile.
2. App opens saved DeliveryAddress list.
3. Customer adds or edits a DeliveryAddress.
4. After Save, app returns to the saved DeliveryAddress list.
5. The Customer stays in Profile context instead of being forced back to Home.

## Screens

### Dia Chi Giao Hang

This screen shows:

- Top search field for finding a delivery location.
- Current selected or detected location card.
- "Dia chi da luu" section.
- Existing saved DeliveryAddress rows when available.
- Empty/add shortcuts such as "Them dia chi Nha" and "Them dia chi Cong ty" when the Customer has no matching saved address.
- Bottom "Them dia chi moi" action.

Selecting an existing DeliveryAddress from this screen sets it as the current delivery address. If opened from Home, selection should return to Home and update the address pill.

### Them Dia Chi Moi

This screen shows:

- Recipient name.
- Recipient phone.
- Required address selector.
- Optional building/floor.
- Optional gate.
- Address type segmented control: Nha, Cong ty, Khac.
- "Ten dia chi" input only when type is Khac.
- Optional driver note.
- Save button.

The Save button is enabled only when required fields are valid:

- Recipient name is not blank.
- Recipient phone is not blank.
- Delivery address is selected.
- Address type is selected.
- If address type is Khac, custom address name is not blank.

## Save Behavior

Saving a new or edited DeliveryAddress should:

1. Persist the DeliveryAddress.
2. Mark it as the current delivery address.
3. Return according to source context:
   - From Home: return to Home and update the address pill.
   - From Profile: return to the saved DeliveryAddress list.

This source-aware return behavior is intentional because Home is an ordering flow, while Profile is a management flow.

## Data Scope

For the first implementation, local persistence is acceptable if backend address APIs are not ready. The UI should be structured so a repository can later swap local storage for Supabase/API without changing screen behavior.

## Error And Empty States

- If no DeliveryAddress exists, show clear add actions instead of an empty list only.
- If Save validation fails, keep the Customer on the form and highlight the missing field.
- If persistence fails, keep the entered data on screen and show a concise error message.

## Implementation Notes

- Reuse the existing `AddressListFragment` direction, but refine it into a source-aware picker/manager.
- Do not make the "Giao den" label clickable; only the address pill below it should navigate.
- Keep vocabulary aligned with repo domain docs: code should model this as `DeliveryAddress`, even if some existing files currently use shorter `Address` names.
