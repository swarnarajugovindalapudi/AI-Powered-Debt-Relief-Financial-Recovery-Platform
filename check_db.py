import sqlite3

def check_schema():
    conn = sqlite3.connect('backend/finrelief.db')
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
    result = cursor.fetchone()
    if result:
        print(result[0])
        
        # Check if full_name is in the schema
        if 'full_name' not in result[0]:
            print("Adding full_name column to users table...")
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR DEFAULT ''")
                conn.commit()
                print("Column added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")
    else:
        print("Table 'users' not found.")
    conn.close()

if __name__ == "__main__":
    check_schema()
