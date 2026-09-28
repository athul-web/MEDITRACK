# Hospital Distance, Directions & Equipment Display - Todo List

## Phase 1: Fix Distance Calculation Accuracy
- [x] Investigate why distance from current location to hospitals is incorrect
- [x] Check hospital coordinates in database - are they accurate?
- [x] Improve fallback logic when user location is not precise
- [x] Consider using hospital address geocoding for more accurate distances
- [x] Add debug logging to verify user coordinates and hospital coordinates

## Phase 2: Add "Get Directions" Button to Hospital Card
- [x] Add "Get Directions" button to HospitalCard component (desktop, tablet, mobile)
- [x] Implement handleGetDirections function in HospitalCard (similar to HospitalDetailsPage)
- [x] Use hospital coordinates if available, otherwise fall back to address-based Google Maps URL
- [x] Style button consistently with existing action buttons
- [x] Connect Get Directions in HospitalList and HomePage

## Phase 3: Move Equipment/Resources to View Details Tab Only
- [x] Remove ResourceStatusGrid from HospitalCard component
- [x] Keep ResourceStatusGrid only in HospitalDetailsPage
- [x] Update HospitalCard layout to fill space left by removed resources
- [x] Ensure HospitalDetailsPage shows all resources clearly

## Phase 4: Testing & Verification
- [ ] Test distance accuracy with various locations
- [ ] Test Get Directions button opens Google Maps correctly
- [ ] Verify resources only appear in View Details page
- [ ] Test responsive layouts (desktop, tablet, mobile) after changes