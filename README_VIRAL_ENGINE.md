# Viral Engine Implementation Guide

## Features Implemented
1.  **Manual do Movimento (Brand Identity)**:
    - Configure your persona, tone of voice, beliefs, and vocabulary in the "Identidade" tab.
    - This data is automatically injected into the "Personalizer" Agent (Agent 5).

2.  **Viral Engine Workflow Template**:
    - Click "Viral Template" in the Flow Builder to load the standard 5-Agent chain:
        - **Observer**: Analyzes patterns.
        - **Strategist**: Formulates theses.
        - **Researcher**: Gathers evidence.
        - **Architect**: Structures the script (80/20 rule).
        - **Personalizer**: Applies your Brand Identity.

3.  **Viral Score Visualization**:
    - The Final Output node now displays a simulated "Viral Potential" score and triggered psychological patterns.

## deployment Required
The logic for the specialized agents resides in the Supabase Edge Function `execute-workflow`.
Because the CI/CD environment lacks the Supabase Access Token, **you must deploy the function manually** from your terminal:

```bash
npx supabase functions deploy execute-workflow
```

## How to Test
1.  Go to the "Idea" page (or Flow Builder).
2.  Switch to the **Identidade** tab and fill in your "Manual do Movimento".
3.  Switch back to **Flow Builder**.
4.  Click **Viral Template**.
5.  Click **Save** and then **Run**.
6.  Watch the logs as each agent executes its role!
