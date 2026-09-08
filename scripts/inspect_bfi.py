import pandas as pd

# Load the raw BFI weekend box office report.
# header=None tells Pandas not to automatically use the first
# row of the spreadsheet as the DataFrame's column headers.
# The ODS file requires the odf engine to be read by Pandas.
df = pd.read_excel(
    "data/raw/BFI-weekend-box-office-report-2026-06-05-07.ods",
    engine="odf",
    header=None,
)

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

# Export the cleaned DataFrame as a CSV file in the processed data folder.
# index=False prevents Pandas from saving the DataFrame's index as an
# additional column in the CSV file.
df.to_csv("data/processed/bfi_box_office_05-06-2026_to_07-06-2026.csv", index=False)

# Command used to run this script from the project root:
# python scripts\inspect_bfi.py
