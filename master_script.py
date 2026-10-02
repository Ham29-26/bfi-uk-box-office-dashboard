import subprocess
import sys


# Run this method and file to process the raw BFI ods sheets into csv,
# extract the csv data and load it into our PostgreSQL database
# and finally populate other movie metadata fields from our TMDB API
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

        # Step 2: Load processed CSV files into PostgreSQL.
        run_script(
            [sys.executable, "scripts/load_bfi.py"], "Step 2 - CSV to PostgreSQL"
        )

        # Step 3: Populate missing movie metadata using TMDB.
        run_script(
            ["node", "backend/populate_movie_metadata.js"], "Step 3 - Movie Metadata"
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
