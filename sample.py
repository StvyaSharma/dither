import os
import re

def camel_to_kebab(name):
    """
    Convert CamelCase to kebab-case.
    """
    kebab = re.sub(r'(?<!^)(?=[A-Z])', '-', name).lower()
    return kebab

def convert_filenames(directory):
    """
    Convert all filenames in the given directory from CamelCase to kebab-case.
    """
    for filename in os.listdir(directory):
        # Skip directories
        if os.path.isdir(os.path.join(directory, filename)):
            continue
        
        # Get the file name and extension
        name, ext = os.path.splitext(filename)
        
        # Convert to kebab-case
        kebab_name = camel_to_kebab(name)
        
        # Create the new filename
        new_filename = kebab_name + ext
        
        # Rename the file
        os.rename(
            os.path.join(directory, filename),
            os.path.join(directory, new_filename)
        )
        print(f"Renamed: {filename} -> {new_filename}")

if __name__ == "__main__":
    directory = input("Enter the directory path: ")
    convert_filenames(directory)
