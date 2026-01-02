#!/bin/bash
# Script to generate SCRS workflow diagram using various methods

echo "=== SCRS Workflow Diagram Generator ==="
echo ""
echo "Choose a method:"
echo "1. Mermaid (Recommended - Online Editor)"
echo "2. AI Image Generation (DALL-E/Midjourney Prompt)"
echo "3. PlantUML (Alternative)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "=== Mermaid Method ==="
        echo "1. Open https://mermaid.live/"
        echo "2. Copy the Mermaid code from docs/DIAGRAM_GENERATION.md"
        echo "3. Paste into the editor"
        echo "4. Export as PNG (300 DPI) or SVG"
        echo ""
        echo "Opening Mermaid code file..."
        if [ -f "docs/DIAGRAM_GENERATION.md" ]; then
            cat docs/DIAGRAM_GENERATION.md | grep -A 100 "Mermaid Code Template"
        else
            echo "File not found. Please check docs/DIAGRAM_GENERATION.md"
        fi
        ;;
    2)
        echo ""
        echo "=== AI Image Generation Prompt ==="
        echo ""
        echo "Use this prompt with DALL-E, Midjourney, or Stable Diffusion:"
        echo ""
        echo "Create a professional technical diagram showing a complete workflow for a Student Career Recommendation System. The diagram should be in IEEE paper style: Black and white or minimal color scheme. Clear boxes for: Frontend (React), Backend API (Node.js), ML Engine (Python), Database (MongoDB). Arrows showing data flow from user registration through questionnaire submission, profile processing, dual-algorithm clustering (KMeans++ and KMeans Random), algorithm selection, cluster assignment, career recommendation, and visualization. Include labels for each step. Professional, clean, academic style suitable for IEEE conference paper. Landscape orientation. High resolution suitable for publication."
        echo ""
        ;;
    3)
        echo ""
        echo "=== PlantUML Method ==="
        echo "1. Install PlantUML: http://plantuml.com/"
        echo "2. Use PlantUML syntax (see docs/DIAGRAM_GENERATION.md)"
        echo "3. Generate diagram"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac




