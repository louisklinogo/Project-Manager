```mermaid
flowchart TD
    task-1["task-1: Design Database Schema"]
    style task-1 fill:#FFEBEE,stroke:#D32F2F
    task-2["task-2: Implement API Endpoints"]
    style task-2 fill:#FFEBEE,stroke:#D32F2F
    task-3["task-3: Create User Interface"]
    style task-3 fill:#F5F5F5,stroke:#9E9E9E
    task-4["task-4: Develop Frontend Logic"]
    style task-4 fill:#E8F5E9,stroke:#388E3C
    task-5["task-5: Integrate API with Frontend"]
    style task-5 fill:#F5F5F5,stroke:#9E9E9E
    task-6["task-6: Write Unit Tests"]
    style task-6 fill:#E3F2FD,stroke:#1976D2
    task-7["task-7: Write Integration Tests"]
    style task-7 fill:#F5F5F5,stroke:#9E9E9E
    task-8["task-8: Deploy to Staging"]
    style task-8 fill:#FFEBEE,stroke:#D32F2F
    task-9["task-9: Perform User Acceptance Testing"]
    style task-9 fill:#FFEBEE,stroke:#D32F2F
    task-10["task-10: A self-dependent task"]
    style task-10 fill:#FFEBEE,stroke:#D32F2F
    task-2 -->|depends on| task-1
    linkStyle 21 stroke:#D32F2F,stroke-width:2px
    task-1 -->|depends on| task-2
    linkStyle 23 stroke:#D32F2F,stroke-width:2px
    task-4 -->|depends on| task-3
    task-5 -->|depends on| task-3
    task-2 -->|depends on| task-5
    task-2 -->|depends on| task-6
    task-4 -->|depends on| task-6
    task-7 -->|depends on| task-6
    task-5 -->|depends on| task-7
    task-6 -->|depends on| task-8
    task-7 -->|depends on| task-8
    task-9 -->|depends on| task-8
    linkStyle 34 stroke:#D32F2F,stroke-width:2px
    task-8 -->|depends on| task-9
    linkStyle 36 stroke:#D32F2F,stroke-width:2px
    task-10 -->|depends on| task-10
    linkStyle 38 stroke:#D32F2F,stroke-width:2px
    non-existent-task -->|depends on| task-10
```

### Legend

- Red nodes and edges: Circular dependencies
- Green nodes: Completed tasks
- Blue nodes: In-progress tasks
- Gray nodes: Pending tasks
