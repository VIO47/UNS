
# SETUP
1. **Clone the repo**
```bash
   git clone 
   cd comparison-app
```

2. **Install dependencies**
```bash
   npm install
```

3. **Initialise the database**
```bash
   npm run db:init
   npm run db:migrate
```

4. **Start the app**
```bash
   npm run dev
```

This starts both the frontend and the tRPC backend together. The app will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

To test the URL import feature, a dummy endpoint is available once the server is running at:
```
http://localhost:3001/dummy-options
```

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Material UI (MUI) v9 |
| API | tRPC v11 |
| Server | Node.js, tsx |
| Database | SQLite |

Most of the decisions I made for the tech stack are purely for setting up a simple MVP. In a real scenario, I would only stick most probably to using Typescript as the main frontend language as it makes everything easier to visualize on top of adding extra safety if FE and BE are completely decoupled from working. Depending on how much data gets added and how complex the data handling per objects gets, I would even still stick to REST instead of using RPC, but might also just be personal preference of how explicit and simply structured it is. The UI library was just something that I have worked with before, not really much I can comment on, and Vite is just a very simple template creator especially when this was a single page app even without routing.

# PROJECT PROPOSAL
This app resembles a structured database for design options. Users are presented with design options in a table, where the primary interaction is selecting and comparing entries side by side. The comparison view displays each option's specifications in a structured, readable format.

Data can be added either manually through a form, or by providing an external URL. When importing from a URL, the app attempts to map the incoming fields directly to the database schema. If an exact match isn't found, the user is presented with a mapping interface to align the fields manually.

# DATA ARCHITECTURE

## HIGH LEVEL LOGIC
Despite creating a simple MVP, I would consider that creating migrations is still a simple trick which is standard now considering the usage of multiple server instances. I started with a simple migration where I initialized the `design_options`. There I also added the tags despite not tackling them because they would be relevant for better selection of data.

To make the data scalable for when there would be 5K+ options inside the database, I decided to go for a server side filtering, with caching of query results. This means that repeatedly searching, deleting the search input and filtering again wont be so computationally expensive. In this model, I only indexed by title, because this is the only way of filtering, but if other values are available to filter they should also be indexed on. I am aware that the search doesn't work optimal because it clears out the field, but I wanted to test loading information as a filter takes longer to process than a simple GET ALL.

I opted for a soft delete just because of how often I saw people asking to have data recovered even years after having it deleted. A periodic job to delete stale data can be added in case this becomes hard to maintain when more complexity is added to the architecture.

## TABLES

`design_options`
| Column          | Type     | Constraints / Default                | Description                |
| --------------- | -------- | ------------------------------------ | -------------------------- |
| id              | INTEGER  | PRIMARY KEY                          | Unique option identifier   |
| title           | TEXT     | NOT NULL                             | Option name                |
| description     | TEXT     | —                                    | Optional description       |
| area            | REAL     | —                                    | Area metric                |
| embodied_carbon | REAL     | —                                    | Embodied carbon value      |
| daylight_score  | REAL     | —                                    | Daylight performance score |
| cost_estimate   | REAL     | —                                    | Estimated cost (EURO)      |
| program_fit     | TEXT     | —                                    | Program fit classification |
| notes           | TEXT     | —                                    | Additional notes           |
| created         | DATETIME | DEFAULT CURRENT_TIMESTAMP            | Creation timestamp         |
| updated         | DATETIME | DEFAULT CURRENT_TIMESTAMP            | Last update timestamp      |
| deleted         | DATETIME | DEFAULT NULL                         | Soft delete timestamp      |

`tags`
| Column | Type    | Constraints / Default | Description           |
| ------ | ------- | --------------------- | --------------------- |
| id     | INTEGER | PRIMARY KEY           | Unique tag identifier |
| title   | TEXT    | NOT NULL, UNIQUE      | Tag name              |

`design_options_tags`
| Column           | Type    | Constraints / Default                      | Description          |
| ---------------- | ------- | ------------------------------------------ | -------------------- |
| design_option_id | INTEGER | NOT NULL, FOREIGN KEY → design_options(id) | Linked design option |
| tag_id           | INTEGER | NOT NULL, FOREIGN KEY → tags(id)           | Linked tag           |
| PRIMARY KEY      | —       | (design_option_id, tag_id)                 | Composite key        |

I decided to create a separate `tags` table to allow for more efficient querying in cases where tags are frequently used for filtering or search. This choice depends on the specific use case, but I don’t consider it a poor design decision, since the number of tags in the system is expected to remain relatively small, making the overhead of an additional table and join negligible.

However, if tags are only used for simple data entry in the UI, this approach might be overkill. In that case, storing tags as a JSON field directly inside the `design_options` table would likely be sufficient and simpler to implement.

# TRADEOFFS
One of the things I had simplify was the actual development environment. Any changes I made to the server or data structure meant restarting the whole app in order for the changes to apply. Other things I can now think of is how the structure doesn't have specialized components which can be reused, I didn't break down the structure of the front end too much just for speed. Otherwise, it would make sens to have logic-split components. ALso, for simplicity, there is no data layer, like a Pinia store for actually fetching data and translating the structure. Instead, I do everything inside the app, which can easily not scale well. Using SQLite is also another pitfall of scalability.

# FUTURE IMPROVEMENTS
Ideally, when working with larger datasets, a user should have access to more advanced filtering options. If the amount of data grows, relying only on a simple search by title becomes limiting, so additional filters (e.g., dropdowns, tags, or ranges) would significantly improve usability and data exploration.

From the perspective of the environment setup, there are also clear areas for improvement. One important addition would be user accounts and permission management. This would allow users to only see design options they are authorized to access, and it would enable different interaction levels, such as editing options versus only viewing them for review.

From an architectural standpoint, I would consider introducing data classes corresponding to each database table. This would make it easier to encapsulate logic related to processing and validating individual fields, especially if the application grows in complexity. Given the current scope, I chose not to implement this, as it would have added extra structure without providing immediate value.

I would also improve error handling, particularly when adding new items. At the moment, there are limited safeguards to prevent invalid data from being inserted. For example, I introduced the concept of tags as potential filters, but did not fully implement them. If completed, the backend should validate inputs and return meaningful errors, such as notifying the user when a tag already exists. Apart from FE error handling, a for sure must is dat avalidation inside the BE. Right now, you could easily do injections through the inputs of the option design. Also, you can add values that don't make sens such as negative costs.

Finally, the current filtering capabilities in the UI are quite minimal. Filtering is limited to a basic text search by title, which is insufficient for more complex use cases. Enhancing this with additional controls, such as dropdowns, range filters, or tag-based filtering, would make the interface more user-friendly. For better comparisson, I would also add a feature of highlighting differences and allowing to add more items in the comparison dialog (a plus button to have another dummy empty select).

My biggest disappointment is the UI, both visually and in terms of user experience. In the interest of building a functional prototype quickly, I prioritised simplicity over polish, which meant leaving out interactions and design details that would have made the app feel more intuitive and cohesive.

