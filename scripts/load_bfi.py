import psycopg
import pandas as pd
from pathlib import Path

# Connect to the local PostgreSQL database.
# The connection is used throughout the script to execute SQL queries
# and insert the processed BFI data into the database.
connection = psycopg.connect(
    host="localhost",
    port=5432,
    dbname="bfi_box_office",
    user="postgres",
    password="Wombat2006!",
)

print("Database connected!")


def populate_database(csv_file, reporting_id):
    # Load the processed CSV containing the Top 15 films for one
    # reporting weekend.
    processed_df = pd.read_csv(csv_file)

    # Create a cursor for executing SQL queries on the database.
    cursor = connection.cursor()

    # Process each film record in the CSV.
    for index, row in processed_df.iterrows():

        # -------------------------
        # Populate distributor table
        # -------------------------

        # Extract the distributor name from the current film record.
        distributor_name = row["Distributor"]

        # Check whether this distributor already exists.
        # The distributor table has a UNIQUE constraint on distributor_name,
        # so each distributor should only be stored once.
        cursor.execute(
            "SELECT distributor_id FROM distributor WHERE distributor_name = %s",
            (distributor_name,),
        )

        distributor_id_result = cursor.fetchone()

        if distributor_id_result is not None:
            # Reuse the ID of the existing distributor.
            distributor_id = distributor_id_result[0]
            print("Distributor already exists!")
            print("Distributor ID:", distributor_id)

        else:
            # Insert the new distributor and retrieve its generated ID.
            cursor.execute(
                "INSERT INTO distributor (distributor_name) VALUES (%s) RETURNING distributor_id",
                (distributor_name,),
            )

            distributor_id = cursor.fetchone()[0]

            connection.commit()

            print("Distributor inserted!")
            print("Distributor ID:", distributor_id)

        # -------------------------
        # Populate film table
        # -------------------------

        # Extract the film information from the current record.
        film_title = row["Film"]
        country = row["Country of Origin"]

        # Check whether this film already exists.
        # Existing films are reused across reporting weekends rather than
        # creating a duplicate film record.
        cursor.execute(
            "SELECT film_id FROM film WHERE film_title = %s",
            (film_title,),
        )

        film_id_result = cursor.fetchone()

        if film_id_result is not None:
            # Reuse the ID of the existing film.
            film_id = film_id_result[0]
            print("Film already exists!")
            print("Film ID:", film_id)

        else:
            # Insert the new film and retrieve its generated ID.
            # film_poster_img_path is currently NULL because poster images
            # will be added during a later stage of the project.
            cursor.execute(
                "INSERT INTO film (distributor_id, film_title, country_of_origin, film_poster_img_path) VALUES (%s, %s, %s, %s) RETURNING film_id",
                (distributor_id, film_title, country, None),
            )

            film_id = cursor.fetchone()[0]

            connection.commit()

            print("Film inserted!")
            print("Film ID:", film_id)

        # ----------------------------
        # Populate weekly box office table
        # ----------------------------

        # Extract the weekly performance metrics from the current record.
        # These values belong to the current film and reporting weekend.
        film_rank = row["Rank"]
        weekend_gross = row["Weekend Gross"]
        percent_change = row["% change on last week"]
        weeks_on_release = row["Weeks on release"]
        number_of_cinemas = row["Number of cinemas"]
        site_average = row["Site average"]
        total_gross_to_date = row["Total Gross to date"]

        # Insert the film's box office performance for the current
        # reporting weekend.
        # The film_id and reporting_id together identify the specific
        # film/report combination.
        cursor.execute(
            "INSERT INTO weekly_box_office (film_id, reporting_id, film_rank, weekend_gross, percent_change, weeks_on_release, number_of_cinemas, site_average, total_gross_to_date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                film_id,
                reporting_id,
                film_rank,
                weekend_gross,
                percent_change,
                weeks_on_release,
                number_of_cinemas,
                site_average,
                total_gross_to_date,
            ),
        )

        # Commit the weekly record so that the insertion is permanently
        # saved to the database.
        connection.commit()

        # Retrieve the reporting dates from the processed CSV for
        # confirmation in the console output.
        start_date = row["Start Date"]
        end_date = row["End Date"]

        print(
            f"Weekly Box Office record for the movie {film_title} during the weekend {start_date} to {end_date} has been inserted!"
        )


# Locate the folder containing the processed BFI CSV files.
processed_folder = Path("data/processed")

# Process each CSV file in the processed data folder.
# Each CSV represents one BFI reporting weekend.
for csv_file in processed_folder.glob("*.csv"):

    # Read the CSV so that the reporting dates can be identified.
    processed_df = pd.read_csv(csv_file)

    # The reporting dates are the same for every row in a CSV,
    # so the first row is sufficient to obtain them.
    start_date = processed_df.loc[0, "Start Date"]
    end_date = processed_df.loc[0, "End Date"]

    # Check whether this reporting weekend has already been added
    # to the database.
    cursor = connection.cursor()

    cursor.execute(
        "SELECT reporting_id FROM reporting_weekend WHERE start_date = %s AND end_date = %s",
        (start_date, end_date),
    )

    reporting_id_result = cursor.fetchone()

    # ----------------------------
    # Populate reporting_weekend table
    # ----------------------------

    if reporting_id_result is not None:
        # The reporting weekend has already been processed.
        # Reuse its ID and skip the remaining database population
        # to prevent duplicate weekly records.
        reporting_id = reporting_id_result[0]
        print("Reporting weekend already exists!")
        print("Reporting ID:", reporting_id)

    else:
        # Insert the new reporting weekend and retrieve its generated ID.
        cursor.execute(
            "INSERT INTO reporting_weekend (start_date, end_date) VALUES (%s, %s) RETURNING reporting_id",
            (start_date, end_date),
        )

        reporting_id = cursor.fetchone()[0]

        connection.commit()

        print("Reporting weekend inserted!")
        print("Reporting ID:", reporting_id)

        # A new reporting weekend means this CSV has not been processed yet.
        # Populate the distributor, film, and weekly box office tables
        # using the reporting ID created above.
        populate_database(csv_file, reporting_id)


# Command used to run this script from the project root:
# python scripts\load_bfi.py
