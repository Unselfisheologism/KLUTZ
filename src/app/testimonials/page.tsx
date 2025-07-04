import Head from 'next/head';

export default function TestimonialsPage() {
  return (
    <>
      <Head>
        <title>Testimonials - KLUTZ</title>
        <meta name="description" content="Read what our users are saying about KLUTZ." />
      </Head>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-primary mb-8">
          Testimonials
        </h1>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Embed your testimonials here. You can use iframes,
 copy-paste testimonial content, or fetch them from a data source. */}
          <iframe style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1275497?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>
          {/* You can remove the example testimonials below if you are only using embeds */}
 <iframe style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1279092?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>
          {/* Add more testimonials as needed */}
 <iframe style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1279088?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>
 <iframe style={{ border: 'none' }} src="https://cards.producthunt.com/cards/reviews/1277790?v=1" width="500" height="405" frameBorder="0" scrolling="no" allowFullScreen></iframe>
        </section>
        {/* You can add more sections for different types of testimonials or a form for submitting testimonials */}
      </div>
    </>
  );
}