
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
This compariosn app will act more like a stylized database, for 2 main contents: projects and design options per project. User will be able to select a project for which there are a list of design options presented in a table. Most of the focus is on data visualization, as this is most of the use case. A user journey would be that they load the page, select through a couple of options and press the compare button to see their specs in a table-view manner. To be able to add data, they can choose to manually type it or to use an external URL. The URL will try to match exactly as the database stores a design option. If there isn't a perfect match, you are shown a mapping table.

# DATA ARCHITECTURE

## HIGH LEVEL LOGIC
Despite creating a simple MVP, I would consider that creating migrations is still a simple trick which is standard now considering the usage of multiple server instances. I started with a simple migration where I initialized the design_options. There I also added the tags despite not tackling them because they would be relevant for better selection of data.

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

I would also improve error handling, particularly when adding new items. At the moment, there are limited safeguards to prevent invalid data from being inserted. For example, I introduced the concept of tags as potential filters, but did not fully implement them. If completed, the backend should validate inputs and return meaningful errors, such as notifying the user when a tag already exists.

Finally, the current filtering capabilities in the UI are quite minimal. Filtering is limited to a basic text search by title, which is insufficient for more complex use cases. Enhancing this with additional controls, such as dropdowns, range filters, or tag-based filtering, would make the interface more user-friendly. For better comparisson, I would also add a feature of highlighting differences and allowing to add more items in the comparison dialog (a plus button to have another dummy empty select).

My biggest dissapointment would be how the app looks and even some user interactions, but also, because of trying to make a simple mock, I decided to add very simple interactions instead of making everything more appealing and even more dynamic, more intuitive and just combine better.

