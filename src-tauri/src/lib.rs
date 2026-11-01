use tauri_plugin_sql::{Migration, MigrationKind};

// Table definitions. Each schema change is a NEW migration with the next version number.
// Existing migrations are never edited, so users' data survives updates.
fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/0001_initial.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "workspace_owner_member_trigger",
            sql: include_str!("../migrations/0002_workspace_owner_member.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "task_checklist_and_notes",
            sql: include_str!("../migrations/0003_task_checklist_and_notes.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "labels",
            sql: include_str!("../migrations/0004_labels.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "documents",
            sql: include_str!("../migrations/0005_documents.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "activity_log",
            sql: include_str!("../migrations/0006_activity_log.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // The database file is opened at startup ("preload" in tauri.conf.json),
        // and the migrations run when it is opened.
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:avenqor.db", migrations())
                .build(),
        )
        // "Save as" and "Open" windows, and file access limited to the files chosen in them.
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
