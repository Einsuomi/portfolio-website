## ADDED Requirements

### Requirement: Hotel rating forecasting (ML thesis) page
There SHALL be a project detail page at `/projects/hotel-rating-forecasting` for Tong's 2023 Åbo
Akademi master's thesis, "Machine Learning for Forecasting Future Reservations' Ratings"
(Radisson Blu Seaside, Helsinki). It SHALL present a machine-learning case study: forecasting,
from the data a guest provides at booking (PNR), whether a future reservation will rate below the
hotel's own average — binarized at the hotel's 8.4/10 Booking.com rating — so the hotel can
intervene before arrival; together with a text-analysis of reviews that surfaces what guests
praise and complain about.

The page SHALL use the reserved Model & Results block as its quantitative centerpiece (problem,
data, features, model, a metrics row, and a takeaway) and SHALL report the result honestly,
including the ~60% recall on the below-average class and the precision/recall trade-off, rather
than overstating performance. Its architecture SHALL be carried by one native, on-brand diagram
(built per the existing native-diagram requirement — inline SVG/HTML/CSS, real text, no runtime
JavaScript, crisp at any zoom, legible with JS disabled and under reduced motion, no horizontal
overflow at a 390px viewport) depicting the modelling pipeline. No raw thesis figures SHALL be
used. The page SHALL surface the project name and one-line value within the first viewport.

#### Scenario: ML page presents the study and its honest result
- **WHEN** the hotel-rating-forecasting page is rendered
- **THEN** it shows the native pipeline diagram, a Model & Results block with the problem, data, features, model, a metrics row, and a takeaway, and prose in the established premium voice describing the prediction goal and the parallel text-analysis insight

#### Scenario: Pipeline diagram reflects the thesis method
- **WHEN** the pipeline diagram is rendered
- **THEN** it shows the flow from a Booking.com scrape, through preprocessing that binarizes the rating at the 8.4 threshold, to the five PNR features, to training across four algorithms over feature subsets (124 tuned models), to selection by the custom TN-score, ending at the best ANN model

#### Scenario: Result is reported honestly
- **WHEN** the Model & Results block is rendered
- **THEN** it states the best model's TN-score and recall on the below-average class and acknowledges the precision/recall trade-off, framing the outcome as a genuine finding rather than a success

#### Scenario: Name and value land fast
- **WHEN** the ML page first paints
- **THEN** the project name and its one-line value are visible in the first viewport

#### Scenario: Reachable from the gallery
- **WHEN** a recruiter activates the ML project's card in the homepage Projects gallery
- **THEN** they navigate to `/projects/hotel-rating-forecasting`, and the back affordance returns them to the gallery

### Requirement: Gallery section is conditional
A project detail page that provides no gallery figures SHALL NOT render an empty gallery section
(no orphan section heading). Pages that provide gallery figures SHALL render the gallery section
unchanged.

#### Scenario: Page without gallery figures
- **WHEN** a project detail page whose `gallery` list is empty is rendered
- **THEN** no gallery ("Inside the pipeline") section or heading appears

#### Scenario: Page with gallery figures
- **WHEN** a project detail page that provides gallery figures is rendered
- **THEN** the gallery section renders all its figures as before
