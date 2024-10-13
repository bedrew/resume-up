export interface TokenUpdateResult {
    access_token: string;         // string
    token_type: "bearer";         // literal type
    refresh_token: string;        // string
    expires_in: number;           // number
}

export interface Applicant {
    auth_type: "applicant";       // literal type
    is_admin: boolean;            // boolean
    is_applicant: boolean;        // boolean
    is_application: boolean;      // boolean
    is_employer: boolean;         // boolean
    is_employer_integration: boolean; // boolean
    email: string;                // string
    first_name: string;           // string
    id: string;                   // string
    is_anonymous: boolean;        // boolean
    last_name: string;            // string
    mid_name: string;             // string
    middle_name: string;          // string
    phone: string;                // string
    counters: {
        new_resume_views: number;     // number
        resumes_count: number;       // number
        unread_negotiations: number; // number
    };
    employer: any;               // any (replace with proper type if known)
    is_in_search: boolean;        // boolean
    manager: any;                 // any (replace with proper type if known)
    negotiations_url: string;     // string
    personal_manager: any;        // any (replace with proper type if known)
    profile_videos: {
        items: Array<{
            download_url: {
                expires_at: string;  // string (ISO date format)
                url: string;         // string (URL)
            };
            id: string;              // string
        }>;
    };
    resumes_url: string;          // string
    user_statuses: {
        job_search_status: {
            id: string;                // string
            last_change_time: string;  // string (ISO date format)
            name: string;              // string
        };
    };
}

export interface Resume {
    found: number;                      // number
    items: Array<{
        access: {
            type: {
                id: string;             // string
                name: string;           // string
            };
        };
        actions: {
            download: {
                pdf: {
                    url: string;        // string (URL)
                };
                rtf: {
                    url: string;        // string (URL)
                };
            };
        };
        age: number;                    // number
        alternate_url: string;          // string (URL)
        area: {
            id: string;                 // string
            name: string;               // string
            url: string;                // string (URL)
        };
        auto_hide_time: {
            id: string;                 // string
            name: string;               // string
        };
        blocked: boolean;               // boolean
        can_publish_or_update: boolean; // boolean
        certificate: Array<any>;        // any[] (replace with proper type if known)
        contact: Array<{
            comment?: string;           // optional string
            need_verification: boolean; // boolean
            preferred: boolean;         // boolean
            type: {
                id: string;             // string
                name: string;           // string
            };
            value: {
                city?: string;          // optional string
                country?: string;       // optional string
                formatted: string;      // string
                number?: string;        // optional string
            };
            verified: boolean;          // boolean
        }>;
        created: string;                // string (ISO date format)
        created_at: string;             // string (ISO date format)
        download: {
            pdf: {
                url: string;            // string (URL)
            };
            rtf: {
                url: string;            // string (URL)
            };
        };
        education: {
            level: {
                id: string;             // string
                name: string;           // string
            };
            primary: Array<any>;        // any[] (replace with proper type if known)
        };
        experience: Array<{
            area: {
                id: string;             // string
                name: string;           // string
                url: string;            // string (URL)
            };
            company: string;            // string
            company_id: string | null;  // string | null
            company_url: string;        // string (URL)
            employer: any | null;       // any | null
            end: string;                // string (ISO date format)
            industries: Array<any>;     // any[] (replace with proper type if known)
            industry: {
                id: string;             // string
                name: string;           // string
            };
            position: string;           // string
            start: string;              // string (ISO date format)
        }>;
        finished: boolean;              // boolean
        first_name: string;             // string
        gender: {
            id: string;                 // string
            name: string;               // string
        };
        hidden_fields: Array<{
            id: string;                 // string
            name: string;               // string
        }>;
        id: string;                     // string
        last_name: string;              // string
        marked: boolean;                // boolean
        middle_name: string | null;     // string | null
        new_views: number;              // number
        next_publish_at: string;        // string (ISO date format)
        paid_services: Array<{
            active: boolean;            // boolean
            id: string;                 // string
            name: string;               // string
        }>;
        photo: {
            "40": string;               // string (URL)
            "100": string;              // string (URL)
            "500": string;              // string (URL)
            id: string;                 // string
            medium: string;             // string (URL)
            small: string;              // string (URL)
        };
        platform: {
            id: string;                 // string
        };
        salary: {
            amount: number;             // number
            currency: string;           // string
        };
        similar_vacancies: {
            counters: {
                total: number;          // number
            };
            url: string;                // string (URL)
        };
        status: {
            id: string;                 // string
            name: string;               // string
        };
        tags: Array<{
            id: string;                 // string
        }>;
        title: string;                  // string
        total_experience: {
            months: number;             // number
        };
        total_views: number;            // number
        updated: string;                // string (ISO date format)
        updated_at: string;             // string (ISO date format)
        url: string;                    // string (URL)
        views_url: string;              // string (URL)
        visible: boolean;               // boolean
    }>;
    page: number;                       // number
    pages: number;                      // number
    per_page: number;                   // number
}
