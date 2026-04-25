CREATE TABLE design_options (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    area REAL,
    embodied_carbon REAL,
    daylight_score REAL,
    cost_estimate REAL,
    program_fit TEXT,
    notes TEXT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted DATETIME DEFAULT NULL
);
CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL UNIQUE
);
CREATE TABLE design_option_tags (
    design_option_id INTEGER NOT NULL REFERENCES design_options(id),
    tag_id INTEGER NOT NULL REFERENCES tags(id),
    PRIMARY KEY (design_option_id, tag_id)
);
CREATE INDEX idx_design_option_tags_tag_id ON design_option_tags(tag_id);
CREATE INDEX idx_design_options_name ON design_options(name);