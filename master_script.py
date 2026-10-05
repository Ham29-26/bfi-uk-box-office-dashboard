import subprocess
import sys


# Run this method and file to process the raw BFI ods sheets into csv,
# extract the csv data and load it into our PostgreSQL database,
# populate other movie metadata fields from our TMDB API,
# and finally promote the verified local data to Neon.
def run_script(command, script_name):
    print("\n" + "=" * 60)
    print(f"Running {script_name}...")
    print("=" * 60)

    subprocess.run(command, check=True)

    print(f"{script_name} completed successfully!")


def main():

    try:

        # Step 1: Convert raw ODS files into processed CSV files.
        run_script([sys.executable, "scripts/inspect_bfi.py"], "Step 1 - ODS to CSV")

        # Step 2: Load processed CSV files into the local PostgreSQL database.
        run_script(
            [sys.executable, "scripts/load_bfi.py"], "Step 2 - CSV to PostgreSQL"
        )

        # Step 3: Populate missing movie metadata using TMDB.
        run_script(
            ["node", "backend/populate_movie_metadata.js"], "Step 3 - Movie Metadata"
        )

        # Ask the user to review the local database and metadata
        # before allowing any production database operations.
        confirmation = (
            input(
                "\nHave you reviewed the movie metadata and are you ready "
                "to compare and promote the local database to Neon? (y/n): "
            )
            .strip()
            .lower()
        )

        if confirmation != "y":

            print("\nNeon promotion cancelled.")
            print("The local database remains available for review.")

            return

        # Step 4: Compare the local database with Neon and
        # promote any new verified records.
        run_script(
            [sys.executable, "scripts/promote_to_neon.py"], "Step 4 - Promote to Neon"
        )

        print("\n" + "=" * 60)
        print("MASTER SCRIPT COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except subprocess.CalledProcessError as error:

        print("\n" + "=" * 60)
        print("MASTER SCRIPT FAILED!")
        print("=" * 60)

        print(f"Command that failed: {' '.join(error.cmd)}")
        print(f"Exit code: {error.returncode}")

        print("\nThe remaining steps were not executed.")


if __name__ == "__main__":
    main()
