import { CORPORATIONS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";

export async function getAuthUser(): Promise<{
  email: string | undefined;
  name: any;
  corporation: any;
  role: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  return {
    email: user?.email,
    name: user?.user_metadata?.name || user?.email,
    corporation: user?.user_metadata?.corporation,
    role: user?.user_metadata?.role || ""
  };
}

// {
//     "id": "87a1f776-9a8c-4bfe-8e8c-93ae09c4d426",
//     "aud": "authenticated",
//     "role": "authenticated",
//     "email": "admin@mail.ru",
//     "email_confirmed_at": "2024-10-06T12:22:35.242201Z",
//     "phone": "",
//     "confirmed_at": "2024-10-06T12:22:35.242201Z",
//     "last_sign_in_at": "2024-10-30T02:23:39.064513Z",
//     "app_metadata": {
//         "provider": "email",
//         "providers": [
//             "email"
//         ],
//         "role": "Admin"
//     },
//     "user_metadata": {
//         "corporation": "\tДнём с Огнём",
//         "corporations": [
//             null
//         ],
//         "full_name": "Gus",
//         "name": "Gus",
//         "role": "Admin"
//     },
//     "identities": [
//         {
//             "identity_id": "ee676b46-dbd4-4b75-9dee-0b9913bb27b6",
//             "id": "87a1f776-9a8c-4bfe-8e8c-93ae09c4d426",
//             "user_id": "87a1f776-9a8c-4bfe-8e8c-93ae09c4d426",
//             "identity_data": {
//                 "email": "admin@mail.ru",
//                 "email_verified": false,
//                 "phone_verified": false,
//                 "sub": "87a1f776-9a8c-4bfe-8e8c-93ae09c4d426"
//             },
//             "provider": "email",
//             "last_sign_in_at": "2024-10-06T12:22:35.240316Z",
//             "created_at": "2024-10-06T12:22:35.240363Z",
//             "updated_at": "2024-10-06T12:22:35.240363Z",
//             "email": "admin@mail.ru"
//         }
//     ],
//     "created_at": "2024-10-06T12:22:35.232699Z",
//     "updated_at": "2024-10-30T02:23:39.067859Z",
//     "is_anonymous": false
// }