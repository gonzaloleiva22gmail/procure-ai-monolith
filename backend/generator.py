import os
from datetime import datetime
from docxtpl import DocxTemplate

def generate_document(template_filename: str, user_data: dict) -> str:
    """
    Generates a contract document from a template using user provided data.

    Args:
        template_filename: The filename of the template in backend/templates/
        user_data: A dictionary where keys match the jinja tags in the template (e.g., {{ v1 }})

    Returns:
        The absolute path to the generated document.
    """
    # Define paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "templates", template_filename)
    output_dir = os.path.join(base_dir, "output")

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Verify template exists
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at {template_path}")

    # Initialize template
    doc = DocxTemplate(template_path)

    # Render document with user data
    # KEY EXPANSION: Handle Case Sensitivity and Naming Variations
    # If we have 'v25', also create 'V25', 'ref25', 'Ref25', 'question25'
    expanded_context = user_data.copy()
    
    for key, value in user_data.items():
        # Only process keys that start with 'v' followed by a number (e.g., v1, v25)
        if key.lower().startswith('v') and key[1:].isdigit():
            number = key[1:] # extract '25'
            
            # Create variations to catch template mismatches
            expanded_context[f"V{number}"] = value       # V25
            expanded_context[f"ref{number}"] = value     # ref25
            expanded_context[f"Ref{number}"] = value     # Ref25
            expanded_context[f"REF{number}"] = value     # REF25
            expanded_context[f"q{number}"] = value       # q25
            expanded_context[f"Q{number}"] = value       # Q25

    # Render with the expanded context
    doc.render(expanded_context)

    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Base name without extension (assuming .docx)
    clean_name = os.path.splitext(template_filename)[0]
    output_filename = f"{clean_name}_Final_{timestamp}.docx"
    output_path = os.path.join(output_dir, output_filename)

    # Save the document
    doc.save(output_path)
    
    print(f"Document generated successfully: {output_path}")

    return output_path

if __name__ == "__main__":
    # Example usage for testing
    # Note: This requires a valid template to exist in backend/templates/
    print("Generator script loaded.")
