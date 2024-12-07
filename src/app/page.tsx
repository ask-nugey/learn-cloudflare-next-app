import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { Button } from './btn';

type Resp = { dateTime: string };

const typedFetch = (url: string, options?: RequestInit): Promise<Resp> =>
  fetch(url, options).then((res) => res.json() as Promise<Resp>);

const getData = (): Promise<[Resp, Resp, Resp, Resp, Resp]> =>
  Promise.all([
    typedFetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam", {
      cache: 'force-cache',
      next: { tags: ['force-cache', 'all'] },
    }),
    typedFetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Paris", {
      cache: 'no-store',
      next: { tags: ['no-store', 'all'] },
    }),
    typedFetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Brussels", {
      next: { revalidate: 10, tags: ['revalidate10', 'revalidate', 'all'] },
    }),
    typedFetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Paris", {
      next: { revalidate: 30, tags: ['revalidate30', 'revalidate', 'all'] },
    }),
    typedFetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/London", {
      next: { revalidate: 60, tags: ['revalidate60', 'revalidate', 'all'] },
    }),
  ]);

const revalidateAction = async (tag: string) => {
  'use server';

  if (tag.startsWith('/')) {
    revalidatePath(tag);
  } else {
    revalidateTag(tag);
  }
};

export default async function Home() {
  const [
    staticTime,
    dynamicTime,
    revalidateTime10,
    revalidateTime30,
    revalidateTime60,
  ] = await getData();

  const headersList = headers();
  const country = headersList.get('CF-IPCountry') || '???';
  const city = headersList.get('CF-IPCity') || '???';
  const region = headersList.get('CF-IPRegion') || '???';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col items-center flex-1 px-4 sm:px-20 text-center z-10 pt-8 sm:pt-20">
        <h1 className="text-3xl sm:text-5xl font-bold">
          Geolocation & Data Cache
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-gray-700">
          Show localized content based on headers and show API data cached
        </p>

        <section className="border max-w-xl mx-auto w-full border-gray-300 bg-white rounded-lg shadow-lg mt-16 hover:shadow-2xl transition">
          <div className="p-4 flexborder-b bg-gray-50 rounded-b-lg">
            <h4 className="font-semibold text-left">Geolocation Headers</h4>
            <pre className="bg-black text-white font-mono text-left py-2 px-4 rounded-lg mt-4 text-sm leading-6">
              <p>
                <strong>{'x-vercel-ip-city: '}</strong>
                {city}
              </p>
              <p>
                <strong>{'x-vercel-ip-country-region: '}</strong>
                {region}
              </p>
              <p>
                <strong>{'x-vercel-ip-country: '}</strong>
                {country}
              </p>
            </pre>
          </div>

          <div className="p-4 flex justify-center items-between border-b bg-gray-50">
            <h4 className="font-semibold text-left mr-auto">
              Static Time (force-cache)
            </h4>
            <div className="self-center">
              <p className="text-gray-700">{staticTime.dateTime}</p>
            </div>
          </div>

          <div className="p-4 flex justify-center items-between border-b bg-gray-50">
            <h4 className="font-semibold text-left mr-auto">
              Dynamic Time (no-store)
            </h4>
            <div className="self-center">
              <p className="text-gray-700">{dynamicTime.dateTime}</p>
            </div>
          </div>

          <div className="p-4 flex justify-center items-between border-b bg-gray-50">
            <h4 className="font-semibold text-left mr-auto">
              Dynamic Time <br />
              (tags revalidate10 & revalidate)
            </h4>
            <div className="self-center">
              <p className="text-gray-700">{revalidateTime10.dateTime}</p>
            </div>
          </div>

          <div className="p-4 flex justify-center items-between border-b bg-gray-50">
            <h4 className="font-semibold text-left mr-auto">
              Dynamic Time <br />
              (tags revalidate30 & revalidate)
            </h4>
            <div className="self-center">
              <p className="text-gray-700">{revalidateTime30.dateTime}</p>
            </div>
          </div>

          <div className="p-4 flex justify-center items-between border-b bg-gray-50">
            <h4 className="font-semibold text-left mr-auto">
              Dynamic Time <br />
              (tags revalidate60 & revalidate)
            </h4>
            <div className="self-center">
              <p className="text-gray-700">{revalidateTime60.dateTime}</p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-3 gap-2 border-b bg-gray-50">
            <h4 className="font-semibold col-span-3">Revalidate Tags</h4>
            {[
              'no-cache',
              'force-cache',
              'revalidate',
              'revalidate10',
              'revalidate30',
              'revalidate60',
              'all',
              '/',
            ].map((tag) => (
              <Button key={tag} action={revalidateAction} tag={tag} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
