import json

def convert_to_jsonl(input_file_path, output_file_path):
    # Open the input JSON file and load the data
    with open(input_file_path, 'r') as input_file:
        data = json.load(input_file)

    # Open the output file in write mode
    with open(output_file_path, 'w') as output_file:
        for item in data:
            # Convert each item in the array to a JSON string and write it to the output file
            output_file.write(json.dumps(item) + '\n')

# Specify the paths to your input and output files here
input_file_path = './Artworks.json'
output_file_path = './Artworks.jsonl'

convert_to_jsonl(input_file_path, output_file_path)
