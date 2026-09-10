import pandas as pd
from pathlib import Path


def process_bfi_sheet_to_csv(sheet_file_name):
    # Load the raw BFI weekend box office report.
    # header=None tells Pandas not to automatically use the first
    # row of the spreadsheet as the DataFrame's column headers.
    # The ODS file requires the odf engine to be read by Pandas.
    df = pd.read_excel(
        f"data/raw/{sheet_file_name}",
        engine="odf",
        header=None,
    )

    # Store the report title from the first cell.
    # The title contains the start and end dates of the reporting weekend.
    df_weekend_dates = df.iloc[0, 0]

    # Extract the start and end dates from the report title.
    # split() separates the title into individual words, allowing the
    # required date values to be accessed by their positions.
    start_date = df_weekend_dates.split()[4]
    end_date = df_weekend_dates.split()[6]

    # Generate the processed CSV filename using the reporting dates.
    # Replace "/" with "-" so the dates can be used consistently in the filename.
    csv_file_name = (
        "bfi_box_office_"
        + start_date.replace("/", "-")
        + "_to_"
        + end_date.replace("/", "-")
        + ".csv"
    )

    # Display the reporting weekend currently being processed.
    print(
        "Processing "
        + start_date.replace("/", "-")
        + " → "
        + end_date.replace("/", "-")
    )

    # Check whether a processed CSV for this reporting weekend already exists.
    # If it does, skip processing this report to avoid unnecessary work.
    processed_file = Path(f"data/processed/{csv_file_name}")

    if processed_file.exists():
        print("CSV already exists — skipping.")
        return

    # This is a new report, so continue with the cleaning and conversion process.
    print("New report — processing...")

    # The actual column headers are stored in the second row
    # of the spreadsheet (index position 1).
    # Use that row as the DataFrame's column names.
    df.columns = df.iloc[1]

    # Remove the report title row and the duplicated header row.
    # The actual film data begins from row position 2.
    df = df.iloc[2:]

    # Reset the DataFrame index so that it starts from 0 again.
    # drop=True prevents the old index from being added as a column.
    df = df.reset_index(drop=True)

    # Remove the name associated with the column index.
    # This prevents an unnecessary value from appearing above
    # the column headers when the DataFrame is displayed.
    df.columns.name = None

    # Keep only the first 10 columns, which contain the relevant
    # information from the "Top 15 films" table.
    # The remaining columns in the spreadsheet are empty/unnecessary.
    df = df.iloc[:, :10]

    # Keep only the first 15 rows, corresponding to the Top 15 films.
    # This excludes the grand total row and the "Other UK Films" section.
    df = df.iloc[:15]

    # The "% change on last week" column contains "-" for films
    # where a previous-week comparison is not available.
    # Replace "-" with NaN so Pandas treats these values as missing
    # numerical data rather than strings.
    df["% change on last week"] = df["% change on last week"].replace("-", float("nan"))

    # Convert the relevant columns to appropriate numerical data types.
    # This allows Pandas to perform calculations such as max(),
    # min(), mean(), and sum() correctly.
    df["Rank"] = pd.to_numeric(df["Rank"])
    df["Weekend Gross"] = pd.to_numeric(df["Weekend Gross"])
    df["% change on last week"] = pd.to_numeric(df["% change on last week"])
    df["Weeks on release"] = pd.to_numeric(df["Weeks on release"])
    df["Number of cinemas"] = pd.to_numeric(df["Number of cinemas"])
    df["Site average"] = pd.to_numeric(df["Site average"])
    df["Total Gross to date"] = pd.to_numeric(df["Total Gross to date"])

    # Converting string date values to the matching date type
    start_date = pd.to_datetime(start_date, format="%d/%m/%Y").date()
    end_date = pd.to_datetime(end_date, format="%d/%m/%Y").date()

    # Add the reporting weekend dates to every film record.
    # These values identify which reporting weekend each row belongs to.
    df["Start Date"] = start_date
    df["End Date"] = end_date

    # Export the cleaned DataFrame as a CSV file in the processed data folder.
    # index=False prevents Pandas from saving the DataFrame's index as an
    # additional column in the CSV file.
    df.to_csv(f"data/processed/{csv_file_name}", index=False)

    # Confirm that the processed CSV has been successfully generated.
    print(f"CSV file {csv_file_name} has been successfuly generated!")


# Locate the folder containing the raw BFI ODS reports.
raw_folder = Path("data/raw")

# Process every ODS report found in the raw data folder.
for sheet_file in raw_folder.glob("*.ods"):
    process_bfi_sheet_to_csv(sheet_file.name)

# Command used to run this script from the project root:
# python scripts\inspect_bfi.py
