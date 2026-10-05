import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

# Locate the project folders
SCRIPTS_FOLDER = Path(__file__).resolve().parent
BACKEND_FOLDER = SCRIPTS_FOLDER.parent / "backend"


# Load the local database configuration
load_dotenv(BACKEND_FOLDER / ".env")

# Load the Neon database configuration
load_dotenv(SCRIPTS_FOLDER / ".env.neon")


# Connect to the local PostgreSQL database
local_connection = psycopg.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)

print("Local database connected!")


# Connect to the Neon PostgreSQL database
neon_connection = psycopg.connect(
    host=os.getenv("NEON_DB_HOST"),
    port=os.getenv("NEON_DB_PORT"),
    dbname=os.getenv("NEON_DB_NAME"),
    user=os.getenv("NEON_DB_USER"),
    password=os.getenv("NEON_DB_PASSWORD"),
    sslmode="require",
    connect_timeout=10,
)

print("Neon database connected!")


def compare_databases(local_connection, neon_connection):

    # ---------------------------------------------------------
    # Reporting Weekend Comparison
    # ---------------------------------------------------------

    local_cursor = local_connection.cursor()

    local_cursor.execute("""
        SELECT reporting_id
        FROM reporting_weekend
        ORDER BY reporting_id;
    """)

    local_reporting_ids = {row[0] for row in local_cursor.fetchall()}

    neon_cursor = neon_connection.cursor()

    neon_cursor.execute("""
        SELECT reporting_id
        FROM reporting_weekend
        ORDER BY reporting_id;
    """)

    neon_reporting_ids = {row[0] for row in neon_cursor.fetchall()}

    new_reporting_ids = local_reporting_ids - neon_reporting_ids

    print("\nReporting Weekend Comparison")
    print("-" * 40)
    print(f"Local reporting weekends: {len(local_reporting_ids)}")
    print(f"Neon reporting weekends:  {len(neon_reporting_ids)}")
    print(f"New reporting weekends:   {len(new_reporting_ids)}")

    if new_reporting_ids:
        print("\nReporting weekends missing from Neon:")

        for reporting_id in sorted(new_reporting_ids):
            print(f"  Reporting ID: {reporting_id}")

    else:
        print("\nNo new reporting weekends found.")

    # ---------------------------------------------------------
    # Distributor Comparison
    # ---------------------------------------------------------

    local_cursor.execute("""
        SELECT distributor_id
        FROM distributor
        ORDER BY distributor_id;
    """)

    local_distributor_ids = {row[0] for row in local_cursor.fetchall()}

    neon_cursor.execute("""
        SELECT distributor_id
        FROM distributor
        ORDER BY distributor_id;
    """)

    neon_distributor_ids = {row[0] for row in neon_cursor.fetchall()}

    new_distributor_ids = local_distributor_ids - neon_distributor_ids

    print("\nDistributor Comparison")
    print("-" * 40)
    print(f"Local distributors: {len(local_distributor_ids)}")
    print(f"Neon distributors:  {len(neon_distributor_ids)}")
    print(f"New distributors:   {len(new_distributor_ids)}")

    if new_distributor_ids:
        print("\nDistributors missing from Neon:")

        for distributor_id in sorted(new_distributor_ids):
            print(f"  Distributor ID: {distributor_id}")

    else:
        print("\nNo new distributors found.")

    # ---------------------------------------------------------
    # Film Comparison
    # ---------------------------------------------------------

    local_cursor.execute("""
        SELECT film_id
        FROM film
        ORDER BY film_id;
    """)

    local_film_ids = {row[0] for row in local_cursor.fetchall()}

    neon_cursor.execute("""
        SELECT film_id
        FROM film
        ORDER BY film_id;
    """)

    neon_film_ids = {row[0] for row in neon_cursor.fetchall()}

    new_film_ids = local_film_ids - neon_film_ids

    print("\nFilm Comparison")
    print("-" * 40)
    print(f"Local films: {len(local_film_ids)}")
    print(f"Neon films:  {len(neon_film_ids)}")
    print(f"New films:   {len(new_film_ids)}")

    if new_film_ids:
        print("\nFilms missing from Neon:")

        for film_id in sorted(new_film_ids):
            print(f"  Film ID: {film_id}")

    else:
        print("\nNo new films found.")

    # ---------------------------------------------------------
    # Weekly Box Office Comparison
    # ---------------------------------------------------------

    local_cursor.execute("""
        SELECT film_id, reporting_id
        FROM weekly_box_office
        ORDER BY film_id, reporting_id;
    """)

    local_weekly_records = {(row[0], row[1]) for row in local_cursor.fetchall()}

    neon_cursor.execute("""
        SELECT film_id, reporting_id
        FROM weekly_box_office
        ORDER BY film_id, reporting_id;
    """)

    neon_weekly_records = {(row[0], row[1]) for row in neon_cursor.fetchall()}

    new_weekly_records = local_weekly_records - neon_weekly_records

    print("\nWeekly Box Office Comparison")
    print("-" * 40)
    print(f"Local weekly records: {len(local_weekly_records)}")
    print(f"Neon weekly records:  {len(neon_weekly_records)}")
    print(f"New weekly records:   {len(new_weekly_records)}")

    if new_weekly_records:
        print("\nWeekly box office records missing from Neon:")

        for film_id, reporting_id in sorted(new_weekly_records):
            print(f"  Film ID: {film_id} | " f"Reporting ID: {reporting_id}")

    else:
        print("\nNo new weekly box office records found.")

    # Return all the new IDs
    return {
        "reporting_weekend_ids": new_reporting_ids,
        "distributor_ids": new_distributor_ids,
        "film_ids": new_film_ids,
        "weekly_box_office_keys": new_weekly_records,
    }


# Method to transfer any new reporting weekend data from the local db to the neon db
def promote_reporting_weekends(
    local_connection, neon_connection, reporting_weekend_ids
):

    # Check whether there are any new reporting weekends to promote.
    if not reporting_weekend_ids:
        print("\nNo reporting weekends to promote.")
        return

    # Create a cursor for the local database.
    local_cursor = local_connection.cursor()

    # Create a cursor for the Neon database.
    neon_cursor = neon_connection.cursor()

    print("\nPromoting Reporting Weekends")
    print("-" * 40)

    # Retrieve and promote each reporting weekend that is missing from Neon.
    for reporting_id in sorted(reporting_weekend_ids):

        local_cursor.execute(
            """
            SELECT reporting_id, start_date, end_date
            FROM reporting_weekend
            WHERE reporting_id = %s;
        """,
            (reporting_id,),
        )

        reporting_weekend = local_cursor.fetchone()

        # Make sure the local record exists before attempting to insert it.
        if reporting_weekend is None:
            raise ValueError(
                f"Reporting weekend {reporting_id} "
                "could not be found in the local database."
            )

        # Insert the complete reporting weekend record into Neon.
        neon_cursor.execute(
            """
            INSERT INTO reporting_weekend
                (reporting_id, start_date, end_date)
            VALUES
                (%s, %s, %s);
        """,
            reporting_weekend,
        )

        print(
            f"Promoted Reporting ID {reporting_id}: "
            f"{reporting_weekend[1]} → {reporting_weekend[2]}"
        )


# Method to transfer any new distributor data from the local db to the neon db
def promote_distributors(local_connection, neon_connection, distributor_ids):

    # Check whether there are any new distributors to promote.
    if not distributor_ids:
        print("\nNo distributors to promote.")
        return

    # Create a cursor for the local database.
    local_cursor = local_connection.cursor()

    # Create a cursor for the Neon database.
    neon_cursor = neon_connection.cursor()

    print("\nPromoting Distributors")
    print("-" * 40)

    # Retrieve and promote each distributor that is missing from Neon.
    for distributor_id in sorted(distributor_ids):

        local_cursor.execute(
            """
            SELECT distributor_id, distributor_name
            FROM distributor
            WHERE distributor_id = %s;
        """,
            (distributor_id,),
        )

        distributor = local_cursor.fetchone()

        # Make sure the local distributor exists before attempting to insert it.
        if distributor is None:
            raise ValueError(
                f"Distributor {distributor_id} "
                "could not be found in the local database."
            )

        # Insert the complete distributor record into Neon.
        neon_cursor.execute(
            """
            INSERT INTO distributor
                (distributor_id, distributor_name)
            VALUES
                (%s, %s);
        """,
            distributor,
        )

        print(f"Promoted Distributor ID {distributor_id}: " f"{distributor[1]}")


# Method to transfer any new film data from the local db to the neon db
def promote_films(local_connection, neon_connection, film_ids):

    # Check whether there are any new films to promote.
    if not film_ids:
        print("\nNo films to promote.")
        return

    # Create a cursor for the local database.
    local_cursor = local_connection.cursor()

    # Create a cursor for the Neon database.
    neon_cursor = neon_connection.cursor()

    print("\nPromoting Films")
    print("-" * 40)

    # Retrieve and promote each film that is missing from Neon.
    for film_id in sorted(film_ids):

        local_cursor.execute(
            """
            SELECT
                film_id,
                distributor_id,
                film_title,
                country_of_origin,
                film_poster_img_path,
                release_date,
                synopsis,
                original_language
            FROM film
            WHERE film_id = %s;
        """,
            (film_id,),
        )

        film = local_cursor.fetchone()

        # Make sure the local film exists before attempting to insert it.
        if film is None:
            raise ValueError(
                f"Film {film_id} " "could not be found in the local database."
            )

        # Insert the complete film record into Neon.
        neon_cursor.execute(
            """
            INSERT INTO film (
                film_id,
                distributor_id,
                film_title,
                country_of_origin,
                film_poster_img_path,
                release_date,
                synopsis,
                original_language
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """,
            film,
        )

        print(f"Promoted Film ID {film_id}: " f"{film[2]}")


# Method to transfer any new weekly box office data from the local db to the neon db
def promote_weekly_box_office(
    local_connection, neon_connection, weekly_box_office_keys
):

    # Check whether there are any new weekly records to promote.
    if not weekly_box_office_keys:
        print("\nNo weekly box office records to promote.")
        return

    # Create a cursor for the local database.
    local_cursor = local_connection.cursor()

    # Create a cursor for the Neon database.
    neon_cursor = neon_connection.cursor()

    print("\nPromoting Weekly Box Office Records")
    print("-" * 40)

    # Retrieve and promote each new weekly box office record.
    for film_id, reporting_id in sorted(weekly_box_office_keys):

        local_cursor.execute(
            """
            SELECT
                film_id,
                reporting_id,
                film_rank,
                weekend_gross,
                percent_change,
                weeks_on_release,
                number_of_cinemas,
                site_average,
                total_gross_to_date
            FROM weekly_box_office
            WHERE film_id = %s
              AND reporting_id = %s;
        """,
            (film_id, reporting_id),
        )

        weekly_record = local_cursor.fetchone()

        # Make sure the local weekly record exists before
        # attempting to insert it into Neon.
        if weekly_record is None:
            raise ValueError(
                f"Weekly box office record "
                f"({film_id}, {reporting_id}) "
                "could not be found in the local database."
            )

        # Insert the complete weekly box office record into Neon.
        neon_cursor.execute(
            """
            INSERT INTO weekly_box_office (
                film_id,
                reporting_id,
                film_rank,
                weekend_gross,
                percent_change,
                weeks_on_release,
                number_of_cinemas,
                site_average,
                total_gross_to_date
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """,
            weekly_record,
        )

        print(
            f"Promoted Weekly Record: "
            f"Film ID {film_id}, "
            f"Reporting ID {reporting_id}"
        )


# Collecting all the comparison results
comparison = compare_databases(local_connection, neon_connection)


# A final method to promote data from each table in the local db to the neon db sequentially
def promote_to_neon(local_connection, neon_connection, comparison):

    # Store the records that need to be promoted.
    reporting_weekend_ids = comparison["reporting_weekend_ids"]
    distributor_ids = comparison["distributor_ids"]
    film_ids = comparison["film_ids"]
    weekly_box_office_keys = comparison["weekly_box_office_keys"]

    # Count how many new records were found.
    new_reporting_weekends = len(reporting_weekend_ids)
    new_distributors = len(distributor_ids)
    new_films = len(film_ids)
    new_weekly_records = len(weekly_box_office_keys)

    # Check whether there is anything to promote.
    total_new_records = (
        new_reporting_weekends + new_distributors + new_films + new_weekly_records
    )

    if total_new_records == 0:
        print("\nNeon is already up to date.")
        print("No promotion is required.")
        return

    # Show the user exactly what is about to be promoted.
    print("\nPromotion Summary")
    print("=" * 40)
    print(f"New reporting weekends: {new_reporting_weekends}")
    print(f"New distributors:        {new_distributors}")
    print(f"New films:               {new_films}")
    print(f"New weekly records:      {new_weekly_records}")

    # Ask for confirmation before modifying Neon.
    confirmation = (
        input("\nDo you want to promote these records to Neon? (y/n): ").strip().lower()
    )

    if confirmation != "y":
        print("\nPromotion cancelled.")
        return

    print("\nStarting promotion...")
    print("=" * 40)

    try:

        # Promote tables in foreign-key dependency order.
        promote_reporting_weekends(
            local_connection, neon_connection, reporting_weekend_ids
        )

        promote_distributors(local_connection, neon_connection, distributor_ids)

        promote_films(local_connection, neon_connection, film_ids)

        promote_weekly_box_office(
            local_connection, neon_connection, weekly_box_office_keys
        )

        # Commit all changes only after every promotion succeeds.
        neon_connection.commit()

        print("\n" + "=" * 40)
        print("PROMOTION COMPLETED SUCCESSFULLY!")
        print("=" * 40)
        print("All new records have been committed to Neon.")

    except Exception as error:

        # Revert every Neon change made during this promotion.
        neon_connection.rollback()

        print("\n" + "=" * 40)
        print("PROMOTION FAILED!")
        print("=" * 40)
        print("All Neon changes have been rolled back.")
        print(f"Error: {error}")

        # Re-raise the error so the failure is not silently ignored.
        raise


promote_to_neon(local_connection, neon_connection, comparison)


# Close the connection after the test
local_connection.close()
print("\nLocal database connection closed.")

neon_connection.close()
print("Neon database connection closed.")


# python scripts/promote_to_neon.py
