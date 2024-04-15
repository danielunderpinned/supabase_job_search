import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { getJson } from "https://deno.land/x/serpapi/mod.ts";
import * as mod from "https://deno.land/x/lodash@4.17.11-es/forEach.js";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    let target_locations = [
      "Bournemouth, England, United Kingdom",
      "Cambridge, England, United Kingdom",
      "Greater London, England, United Kingdom",
      "Greater Manchester, England, United Kingdom",
    ]

    let target_roles = [
      "translator",
      "content",
      "photographer",
      "singer",
    ]

    target_locations.forEach(async (tl) => {
      console.log(`target location: ${tl}`);

      target_roles.forEach(async (tr) => {
        console.log(`target role: ${tr}`);

        for (let si = 0; si < 10; si += 10) {
          console.log(`starting index ${si}:`)

          let serpapi = await getJson({
            api_key: "65eafc69c233c507ea1269d0bb561c5ac6c147ab38aeb038027591da4829eb71",
            engine: "google_jobs",
            q: `freelance ${tr}`,
            google_domain: "google.co.uk",
            gl: "uk",
            hl: "en",
            location: tl,
            start: si
          });

          if (serpapi) {
            serpapi.jobs_results.forEach(async function (job, i) {

              let { data: jobs, error } = await supabase
                .from('jobs')
                .select("*")
                .eq('job_id', job.job_id)

              console.log(jobs)
              console.log(job.job_id)

              if (!jobs || (jobs.length > 0)) {
                console.log('Found, ignore')
              } else {
                console.log('Not found, insert!')

                const { data, error } = await supabase
                  .from('jobs')
                  .insert([{
                    target_location: tl,
                    target_role: tr,
                    title: job.title,
                    job_id: job.job_id,
                    description: job.description,
                    location: job.location,
                    json: job,
                    company_name: job.company_name,
                    via: job.via,
                  }])
                  .select()
                console.log(data)

              } // ignore or insert
            }); // loop jobs
          } // check result 
        } // loop starting indices
      }); // loop target roles
    }); // loop target locations

    return new Response(`Searching jobs...`);
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})

//   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/job_search' \
//     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//     --header 'Content-Type: application/json' \
//     --data '{"name":"Functions"}'
