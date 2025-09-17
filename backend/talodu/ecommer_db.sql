--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Homebrew)
-- Dumped by pg_dump version 16.8 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    name text,
    description text
);


ALTER TABLE public.categories OWNER TO pasjtene;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO pasjtene;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: product_about_translations; Type: TABLE; Schema: public; Owner: tene
--

CREATE TABLE public.product_about_translations (
    id integer NOT NULL,
    product_about_id integer NOT NULL,
    language character varying(5) NOT NULL,
    about_text character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_about_translations OWNER TO tene;

--
-- Name: product_about_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: tene
--

CREATE SEQUENCE public.product_about_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_about_translations_id_seq OWNER TO tene;

--
-- Name: product_about_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tene
--

ALTER SEQUENCE public.product_about_translations_id_seq OWNED BY public.product_about_translations.id;


--
-- Name: product_abouts; Type: TABLE; Schema: public; Owner: tene
--

CREATE TABLE public.product_abouts (
    id integer NOT NULL,
    product_id integer,
    item_order integer NOT NULL,
    about_text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT about_text_not_empty CHECK ((about_text <> ''::text))
);


ALTER TABLE public.product_abouts OWNER TO tene;

--
-- Name: product_abouts_id_seq; Type: SEQUENCE; Schema: public; Owner: tene
--

CREATE SEQUENCE public.product_abouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_abouts_id_seq OWNER TO tene;

--
-- Name: product_abouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tene
--

ALTER SEQUENCE public.product_abouts_id_seq OWNED BY public.product_abouts.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.product_categories (
    category_id bigint NOT NULL,
    product_id bigint NOT NULL
);


ALTER TABLE public.product_categories OWNER TO pasjtene;

--
-- Name: product_details; Type: TABLE; Schema: public; Owner: tene
--

CREATE TABLE public.product_details (
    id integer NOT NULL,
    product_id integer,
    item_order integer NOT NULL,
    detail_text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT detail_text_not_empty CHECK ((detail_text <> ''::text))
);


ALTER TABLE public.product_details OWNER TO tene;

--
-- Name: product_details_id_seq; Type: SEQUENCE; Schema: public; Owner: tene
--

CREATE SEQUENCE public.product_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_details_id_seq OWNER TO tene;

--
-- Name: product_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tene
--

ALTER SEQUENCE public.product_details_id_seq OWNED BY public.product_details.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.product_images (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    product_id bigint,
    url character varying(500),
    alt_text character varying(100)
);


ALTER TABLE public.product_images OWNER TO pasjtene;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO pasjtene;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_translations; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.product_translations (
    id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    product_id integer,
    language character varying(5) NOT NULL,
    name character varying(255) NOT NULL,
    description text
);


ALTER TABLE public.product_translations OWNER TO pasjtene;

--
-- Name: product_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.product_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_translations_id_seq OWNER TO pasjtene;

--
-- Name: product_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.product_translations_id_seq OWNED BY public.product_translations.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    name text,
    description text,
    price numeric,
    stock bigint,
    shop_id bigint,
    slug text
);


ALTER TABLE public.products OWNER TO pasjtene;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO pasjtene;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    name text,
    description text
);


ALTER TABLE public.roles OWNER TO pasjtene;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO pasjtene;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: shop_employees; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.shop_employees (
    user_id bigint NOT NULL,
    shop_id bigint NOT NULL
);


ALTER TABLE public.shop_employees OWNER TO pasjtene;

--
-- Name: shops; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.shops (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    name text,
    description text,
    owner_id bigint,
    moto text,
    slug text
);


ALTER TABLE public.shops OWNER TO pasjtene;

--
-- Name: shops_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.shops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shops_id_seq OWNER TO pasjtene;

--
-- Name: shops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.shops_id_seq OWNED BY public.shops.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.user_roles OWNER TO pasjtene;

--
-- Name: users; Type: TABLE; Schema: public; Owner: pasjtene
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    username text,
    email text,
    first_name text,
    last_name text,
    password text,
    refresh_token character varying(500),
    refresh_expiry timestamp with time zone,
    pin bigint,
    is_verified boolean DEFAULT false,
    verify_token text,
    verify_expiry timestamp without time zone,
    reset_pw_token character varying(255),
    reset_pw_expiry timestamp with time zone
);


ALTER TABLE public.users OWNER TO pasjtene;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: pasjtene
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO pasjtene;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pasjtene
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: product_about_translations id; Type: DEFAULT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_about_translations ALTER COLUMN id SET DEFAULT nextval('public.product_about_translations_id_seq'::regclass);


--
-- Name: product_abouts id; Type: DEFAULT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_abouts ALTER COLUMN id SET DEFAULT nextval('public.product_abouts_id_seq'::regclass);


--
-- Name: product_details id; Type: DEFAULT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_details ALTER COLUMN id SET DEFAULT nextval('public.product_details_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_translations id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_translations ALTER COLUMN id SET DEFAULT nextval('public.product_translations_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: shops id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shops ALTER COLUMN id SET DEFAULT nextval('public.shops_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.categories (id, created_at, updated_at, deleted_at, name, description) FROM stdin;
2	2025-05-09 16:04:24.736607+01	2025-08-01 19:54:58.21964+01	\N	Books	All kinds of reading materials
3	2025-05-09 16:04:24.737134+01	2025-05-13 06:25:43.766142+01	\N	Clothing	Fashion items and apparel
4	2025-05-09 16:04:24.737663+01	2025-05-13 05:52:21.575091+01	\N	Home & Kitchen	Items for your home
5	2025-05-09 16:04:24.738216+01	2025-05-13 06:22:34.646609+01	\N	Sports	Sports equipment and gear
1	2025-05-09 16:04:24.734035+01	2025-05-13 06:42:55.928037+01	\N	Electronics	Electronic devices and gadgets
\.


--
-- Data for Name: product_about_translations; Type: TABLE DATA; Schema: public; Owner: tene
--

COPY public.product_about_translations (id, product_about_id, language, about_text, created_at, updated_at) FROM stdin;
1	5	fr	Adding fr for Fift About because this is a fantastic productLanguage	2025-07-09 01:10:27.398184+01	2025-07-09 01:10:27.398184+01
2	5	es	Adding ES for ...	2025-07-09 01:11:37.819761+01	2025-07-09 01:11:37.819761+01
3	1	fr	First about for this itemLanguage	2025-07-09 01:13:20.643654+01	2025-07-09 01:13:20.643654+01
4	1	es	Es..	2025-07-09 01:13:34.592775+01	2025-07-09 01:13:34.592775+01
5	1	en	First about for this itemLanguage..	2025-07-09 01:13:44.684749+01	2025-07-09 01:13:44.684749+01
6	3	fr	Traduction en francais du troisieme item	2025-07-10 04:52:37.647888+01	2025-07-10 04:52:37.647888+01
7	4	es	ES Trans.. for  Fourth - This item is very long lasting and you will enjoy it. All customers are happy with thisLanguage	2025-07-13 15:21:13.921915+01	2025-07-13 15:21:13.921915+01
8	4	fr	ceci dure beaucoup	2025-07-13 15:44:29.137212+01	2025-07-13 15:44:29.137212+01
9	6	en	This container can be used for face cream	2025-07-16 22:17:34.179482+01	2025-07-16 22:17:34.179482+01
10	7	en	This container can also be used for oil,	2025-07-17 18:03:36.327034+01	2025-07-17 18:03:36.327034+01
11	8	en	Other colors are available and you can change the color of the cover	2025-07-17 18:04:41.430931+01	2025-07-17 18:04:41.430931+01
12	6	fr	Cette boite peut aussi etre utiliser pour la creme de visage	2025-07-17 19:54:12.464051+01	2025-07-17 19:54:12.464051+01
13	7	fr	Cette boite peut aussu etre utilisé pour de l'huile corporelle	2025-07-17 21:31:10.657862+01	2025-07-17 21:31:10.657862+01
14	8	fr	D'autres couleurs sont disponible, et vous pouvez aussi changer le couvercle	2025-07-17 22:16:03.138349+01	2025-07-17 22:16:03.138349+01
\.


--
-- Data for Name: product_abouts; Type: TABLE DATA; Schema: public; Owner: tene
--

COPY public.product_abouts (id, product_id, item_order, about_text, created_at, updated_at) FROM stdin;
6	521	1	This container can be used for face cream	2025-07-16 22:17:33.982555+01	2025-07-16 22:17:33.982555+01
7	521	2	This container can also be used for oil,	2025-07-17 18:03:36.314901+01	2025-07-17 18:03:36.314901+01
8	521	3	Other colors are available and you can change the color of the cover	2025-07-17 18:04:41.427535+01	2025-07-17 18:04:41.427535+01
1	512	1	First about for this item	2025-07-06 12:28:11.010741+01	2025-07-07 18:02:09.291954+01
3	512	2	Third - this item can store products up t 100% celcius	2025-07-06 12:30:20.678672+01	2025-07-07 18:02:09.318925+01
2	512	3	About second for this item	2025-07-06 12:28:32.556495+01	2025-07-07 18:02:09.319273+01
4	512	4	Fourth - This item is very long lasting and you will enjoy it. All customers are happy with this	2025-07-06 12:31:17.978228+01	2025-07-07 18:02:09.320072+01
5	512	5	Fift About because this is a fantastic product	2025-07-06 15:22:10.893537+01	2025-07-07 18:02:09.320348+01
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.product_categories (category_id, product_id) FROM stdin;
1	9
3	11
4	15
4	10
2	12
1	17
2	17
1	18
3	21
5	20
2	22
2	24
2	14
2	16
3	14
3	16
5	24
4	19
3	25
5	21
2	26
1	28
3	29
2	32
3	32
5	23
3	33
3	22
3	37
2	29
3	34
5	35
2	39
1	41
5	41
3	40
3	44
1	46
3	57
4	60
3	62
5	64
2	1
1	280
5	4
1	7
5	47
1	290
4	305
1	311
1	58
1	268
4	277
3	276
5	304
1	287
5	296
3	297
5	262
5	263
1	267
1	299
2	295
4	261
4	33
4	35
3	36
2	38
1	40
1	42
2	42
4	43
5	43
4	44
3	45
4	45
5	46
4	47
2	48
4	48
1	49
5	49
2	50
4	50
3	51
3	52
2	53
2	54
4	55
3	56
5	56
2	57
2	58
3	59
5	59
3	61
4	63
5	65
1	279
5	277
5	278
1	27
2	27
4	280
4	281
2	3
4	3
3	6
1	273
5	7
5	8
3	288
5	289
3	305
5	306
3	307
5	307
1	308
5	308
2	286
5	286
3	309
5	309
1	310
4	282
2	283
5	284
4	293
3	304
3	287
4	285
4	291
5	292
1	266
3	268
2	264
1	265
3	259
3	301
4	269
5	272
2	302
4	302
4	5
3	258
1	295
5	261
3	260
4	300
4	298
5	298
3	274
2	271
1	275
5	294
2	303
4	303
2	270
1	2
\.


--
-- Data for Name: product_details; Type: TABLE DATA; Schema: public; Owner: tene
--

COPY public.product_details (id, product_id, item_order, detail_text, created_at, updated_at) FROM stdin;
10	512	1	new detail	2025-07-06 01:19:13.540356+01	2025-07-06 01:19:13.540356+01
11	512	0	details 2 for this product	2025-07-06 01:19:56.029009+01	2025-07-06 01:19:56.029009+01
12	512	0	ner dert 	2025-07-06 01:22:27.742077+01	2025-07-06 01:22:27.742077+01
13	512	2	Detail 4 fpr this product	2025-07-06 01:31:07.288683+01	2025-07-06 01:31:07.288683+01
14	512	1	this can be used for testing	2025-07-06 01:51:15.174421+01	2025-07-06 01:51:15.174421+01
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.product_images (id, created_at, updated_at, deleted_at, product_id, url, alt_text) FROM stdin;
32	2025-08-02 14:44:28.291122+01	2025-08-02 14:44:28.291122+01	2025-08-02 14:47:40.590102+01	508	/uploads/products/508/ff38a589-8b93-4e50-8573-a8888a57f8ad.png	
10	2025-05-13 03:03:30.692338+01	2025-05-13 03:03:30.692338+01	\N	508	/uploads/products/508/d23637f8-867e-42dd-ac35-e3c72acd33e6.png	
14	2025-05-14 01:22:15.417266+01	2025-05-14 01:22:15.417266+01	\N	511	/uploads/products/511/04ccdc49-a2ec-4927-a71e-1904cc06ebde.jpg	
28	2025-06-14 18:01:53.917433+01	2025-06-14 18:01:53.917433+01	\N	508	/uploads/products/508/07fde733-6b04-47df-8756-ccf550cbeeee.png	
29	2025-06-14 18:01:54.120932+01	2025-06-14 18:01:54.120932+01	\N	508	/uploads/products/508/b1e71cc7-6763-441e-9ee5-3cd0c5c0eae9.png	
15	2025-05-18 16:29:29.041861+01	2025-05-18 16:29:29.041861+01	\N	521	/uploads/products/521/0305b87b-b5db-465b-83ae-b10c9cb4fb27.jpeg	
30	2025-06-14 18:01:54.16485+01	2025-06-14 18:01:54.16485+01	\N	508	/uploads/products/508/1442cb4b-b107-4c8c-94e5-ac8512d13922.png	
33	2025-08-02 14:52:17.010912+01	2025-08-02 14:52:17.010912+01	\N	508	/uploads/products/508/dec37dd2-8296-4e41-af14-0dd9929dad48.jpeg	
1	2025-05-10 01:27:06.932923+01	2025-05-10 01:27:06.932923+01	2025-05-13 02:16:02.418282+01	4	/uploads/products/4/44c8e28a-0314-465e-8ae8-ebcd2c9e862e.png	
2	2025-05-10 01:27:06.940132+01	2025-05-10 01:27:06.940132+01	2025-05-13 02:16:02.418282+01	4	/uploads/products/4/5344cbb8-e617-4dc1-b3ab-9f9feeba2063.png	
3	2025-05-10 01:27:06.944184+01	2025-05-10 01:27:06.944184+01	2025-05-13 02:16:02.418282+01	4	/uploads/products/4/2b80c29e-6119-4620-8404-886bfb20c45b.png	
4	2025-05-10 01:27:06.948094+01	2025-05-10 01:27:06.948094+01	2025-05-13 02:16:02.418282+01	4	/uploads/products/4/a649c1c8-5bf8-4dcb-a9e4-de3fe6dbb7fc.png	
5	2025-05-10 01:27:06.953754+01	2025-05-10 01:27:06.953754+01	2025-05-13 02:16:02.418282+01	4	/uploads/products/4/92628e1f-cde2-403b-b166-66881419978e.png	
6	2025-05-10 01:27:06.959324+01	2025-05-10 01:27:06.959324+01	2025-05-13 02:16:02.418282+01	4	/uploads/products/4/8e1c093b-3be6-4fdb-a2c9-f127606800bf.png	
34	2025-08-02 14:55:35.026118+01	2025-08-02 14:55:35.026118+01	\N	508	/uploads/products/508/c4ea9294-da21-428e-a9d7-6aad8af95e92.png	
16	2025-05-19 04:42:27.61697+01	2025-05-19 04:42:27.61697+01	2025-06-12 01:00:27.618681+01	512	/uploads/products/512/8365a590-5dda-404a-87b1-2cbb78a3ca15.jpg	
17	2025-05-19 05:04:53.932408+01	2025-05-19 05:04:53.932408+01	2025-06-12 02:05:11.740802+01	512	/uploads/products/512/d8232189-cf38-4550-97d6-0bea98e1fe82.png	
19	2025-05-23 15:35:09.283719+01	2025-05-23 15:35:09.283719+01	\N	531	/uploads/products/531/3ef18335-60f2-4aae-a178-2c63da41be89.jpeg	
13	2025-05-13 06:39:16.955477+01	2025-05-13 06:39:16.955477+01	\N	510	/uploads/products/510/131f6e60-adf1-43ad-afd2-d20f81ddfb12.jpg	
11	2025-05-13 03:22:55.622046+01	2025-05-13 03:22:55.622046+01	\N	509	/uploads/products/509/5d7b923f-34ae-468f-8f8a-d7e5300307a8.png	
9	2025-05-12 18:01:04.191968+01	2025-05-12 18:01:04.191968+01	\N	507	/uploads/products/507/87af9cb7-f9b6-455a-b09f-07a5a2b0bd5e.png	
25	2025-06-14 00:36:16.783263+01	2025-06-14 00:36:16.783263+01	\N	507	/uploads/products/507/cd5f1940-5819-4acf-85ef-bdf4b9c2fd66.png	
26	2025-06-14 00:36:16.827468+01	2025-06-14 00:36:16.827468+01	\N	507	/uploads/products/507/949a5653-8417-49d5-8208-74f16d73bb64.png	
27	2025-06-14 00:36:16.836138+01	2025-06-14 00:36:16.836138+01	\N	507	/uploads/products/507/36f9eefc-c921-4a7b-a352-8a82b65c698a.png	
22	2025-06-14 00:32:04.076921+01	2025-06-14 00:32:04.076921+01	2025-06-14 00:32:34.336058+01	507	/uploads/products/507/a7b4a059-f561-4806-b228-09d79ee38522.png	
23	2025-06-14 00:32:04.199414+01	2025-06-14 00:32:04.199414+01	2025-06-14 00:32:34.336058+01	507	/uploads/products/507/87424ffa-10bd-4439-bccb-3b745756afb3.png	
24	2025-06-14 00:32:04.225334+01	2025-06-14 00:32:04.225334+01	2025-06-14 00:32:55.936234+01	507	/uploads/products/507/a52cf895-3a52-4308-b723-51b633400e91.png	
20	2025-06-08 01:52:50.307758+01	2025-06-08 01:52:50.307758+01	\N	536	/uploads/products/536/698097b1-3800-486c-bff6-8bb417cd15e8.png	
12	2025-05-13 03:45:05.742157+01	2025-05-13 03:45:05.742157+01	\N	512	/uploads/products/512/6a1293d6-d111-4146-bbff-e283e6fcff10.png	
18	2025-05-19 05:04:54.124527+01	2025-05-19 05:04:54.124527+01	\N	512	/uploads/products/512/0b509f20-5801-4598-b4e5-4398f42f2d6c.png	
21	2025-06-12 02:03:39.517866+01	2025-06-12 02:03:39.517866+01	\N	512	/uploads/products/512/79ea98d5-b8df-49bb-b457-67bf75be9c7d.png	
31	2025-06-14 18:01:54.174975+01	2025-06-14 18:01:54.174975+01	2025-07-31 13:38:03.015028+01	508	/uploads/products/508/74e9a36f-6ef0-4b51-8724-4002275046c7.png	
\.


--
-- Data for Name: product_translations; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.product_translations (id, created_at, updated_at, deleted_at, product_id, language, name, description) FROM stdin;
6	2025-07-17 18:02:52.052214	2025-07-17 18:02:52.052214	\N	521	en	Short white bottle 100ml	Short white bottle 100ml
7	2025-07-17 19:57:21.061611	2025-07-17 19:57:21.061611	\N	521	fr	Boite Blanche et courtes 100ml	Boite Blanche et courtes 100ml
5	2025-07-01 07:40:23.075002	2025-07-31 21:11:39.61537	\N	508	fr	Boîte noire de 400ml pour pommade	Boîte noire de 400ml pour pommade 
4	2025-07-01 07:37:36.018907	2025-07-31 16:07:50.884507	\N	508	en	Container for pomade 400ml	Container for pomade 400ml
3	2025-07-01 07:35:44.115687	2025-07-31 21:12:08.42431	\N	508	es	Recipiente negro de 400ml para pomada 	Recipiente negro de 400ml para pomada
1	2025-06-28 18:37:38.812859	2025-06-28 18:37:38.812859	\N	512	en	short white botles 400ml	short white botles 400ml
2	2025-06-28 18:54:01.637784	2025-06-28 18:54:01.637784	\N	512	es	spanish translation of boites blanche et courtes	spanish translation of boites blanche et courtes
8	2025-07-31 21:21:50.367931	2025-07-31 21:34:56.272779	\N	509	es	Envases blancos cortos 300ml	Envases blancos cortos 300ml
9	2025-07-31 21:25:09.819523	2025-07-31 21:35:16.506714	\N	509	en	Short white boxes 300ml	Short white boxes 300ml
10	2025-07-31 21:29:10.699752	2025-07-31 21:36:04.319308	\N	509	fr	Boites courtes 300ml	Boites courtes 300ml
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.products (id, created_at, updated_at, deleted_at, name, description, price, stock, shop_id, slug) FROM stdin;
311	2025-05-09 19:40:08.179597+01	2025-05-11 22:16:14.520904+01	2025-05-12 00:53:14.297931+01	Basic %s electronics	Affordable %s that gets the job done electronics	19.561370060320773	40	21	\N
10	2025-04-14 15:33:30.971934+01	2025-05-11 22:16:13.933142+01	2025-05-13 03:29:29.224661+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
3	2025-04-14 14:58:51.356529+01	2025-05-11 22:16:14.415957+01	2025-05-13 03:29:29.224661+01	Tablet	samsung table	399.99	15	\N	\N
9	2025-04-14 15:33:30.97143+01	2025-05-11 22:16:13.922561+01	2025-05-13 03:29:29.224661+01	Tablet	samsung table	399.99	15	\N	\N
1	2025-04-14 14:58:51.354541+01	2025-05-31 13:43:40.236879+01	\N	Laptop	Del inspiron laptop 1	999.99	15	1	
536	2025-06-07 23:39:31.594535+01	2025-06-08 15:19:13.114665+01	\N	Micro ordinateur Mini 212	Un Micro ordinateur Mini	2500.97	100	16	micro-ordinateur-mini-212-536
13	2025-04-14 16:42:55.847181+01	2025-04-14 16:42:55.847181+01	2025-04-14 17:26:06.511779+01	Tablet	samsung table	399.99	15	\N	\N
309	2025-05-09 19:40:08.160906+01	2025-05-11 22:16:14.528307+01	2025-05-12 00:53:14.297931+01	Premium %s electronics	High-quality %s for all your needs electronics	42.993805684168485	29	21	\N
310	2025-05-09 19:40:08.178415+01	2025-05-11 22:16:14.53144+01	2025-05-12 00:53:14.297931+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	168.7169478002544	101	21	\N
304	2025-05-09 19:40:08.128115+01	2025-05-11 22:16:14.560684+01	2025-05-12 00:53:14.297931+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	175.87678356892613	55	19	\N
305	2025-05-09 19:40:08.150438+01	2025-05-11 22:16:14.464178+01	2025-05-12 00:53:14.297931+01	Basic %s electronics	Affordable %s that gets the job done electronics	24.74982345311559	26	19	\N
22	2025-04-14 17:23:14.522861+01	2025-05-11 22:16:13.982089+01	2025-05-12 00:57:06.400436+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
30	2025-04-14 22:27:01.361814+01	2025-04-14 22:27:01.361814+01	2025-04-15 13:15:49.000477+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
23	2025-04-14 17:23:14.524462+01	2025-05-11 22:16:13.984073+01	2025-05-12 00:57:06.400436+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
24	2025-04-14 17:23:14.524866+01	2025-05-11 22:16:13.987412+01	2025-05-12 00:57:06.400436+01	Tablet	samsung table	399.99	15	\N	\N
25	2025-04-14 17:23:14.525217+01	2025-05-11 22:16:14.010462+01	2025-05-12 00:57:06.400436+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
26	2025-04-14 18:06:07.104654+01	2025-05-11 22:16:14.014473+01	2025-05-12 00:57:06.400436+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
31	2025-04-14 22:27:01.362604+01	2025-04-14 22:27:01.362604+01	2025-04-15 13:22:35.082038+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
28	2025-04-14 18:06:07.106175+01	2025-05-11 22:16:14.016827+01	2025-05-12 00:57:06.400436+01	Tablet	samsung table	399.99	15	\N	\N
34	2025-04-14 22:57:12.918344+01	2025-05-11 22:16:14.026398+01	2025-05-12 01:01:36.325932+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
35	2025-04-14 22:57:12.919974+01	2025-05-11 22:16:14.028824+01	2025-05-12 01:01:36.325932+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
36	2025-04-14 22:57:12.920467+01	2025-05-11 22:16:14.030909+01	2025-05-12 01:01:36.325932+01	Tablet	samsung table	399.99	15	\N	\N
37	2025-04-14 22:57:12.921435+01	2025-05-11 22:16:14.03277+01	2025-05-12 01:01:36.325932+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
38	2025-04-14 23:02:05.699605+01	2025-05-11 22:16:14.034373+01	2025-05-12 01:01:36.325932+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
39	2025-04-14 23:02:05.701085+01	2025-05-11 22:16:14.036882+01	2025-05-12 01:01:36.325932+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
40	2025-04-14 23:02:05.701554+01	2025-05-11 22:16:14.056926+01	2025-05-12 01:01:36.325932+01	Tablet	samsung table	399.99	15	\N	\N
41	2025-04-14 23:02:05.701981+01	2025-05-11 22:16:14.060374+01	2025-05-12 01:01:36.325932+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
42	2025-04-14 23:18:44.344062+01	2025-05-11 22:16:14.062305+01	2025-05-12 01:01:36.325932+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
43	2025-04-14 23:18:44.345375+01	2025-05-11 22:16:14.064887+01	2025-05-12 01:01:36.325932+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
11	2025-04-14 16:42:55.845501+01	2025-05-11 22:16:13.935593+01	2025-05-12 00:58:20.744036+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
12	2025-04-14 16:42:55.846778+01	2025-05-11 22:16:13.956471+01	2025-05-12 00:58:20.744036+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
14	2025-04-14 16:42:55.847559+01	2025-05-11 22:16:13.960497+01	2025-05-12 00:58:20.744036+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
15	2025-04-14 16:44:39.592908+01	2025-05-11 22:16:13.964508+01	2025-05-12 00:58:20.744036+01	A second thing of the past		132.88	0	\N	\N
16	2025-04-14 16:57:53.778757+01	2025-05-11 22:16:13.967077+01	2025-05-12 00:58:20.744036+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
17	2025-04-14 16:57:53.78055+01	2025-05-11 22:16:13.968927+01	2025-05-12 00:58:20.744036+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
18	2025-04-14 16:57:53.781052+01	2025-05-11 22:16:13.971407+01	2025-05-12 00:58:20.744036+01	Tablet	samsung table	399.99	15	\N	\N
19	2025-04-14 16:57:53.781526+01	2025-05-11 22:16:13.974678+01	2025-05-12 00:58:20.744036+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
21	2025-04-14 17:00:55.319834+01	2025-05-11 22:16:13.977193+01	2025-05-12 00:58:20.744036+01	A frourth thing of the past		122.88	0	\N	\N
4	2025-04-14 15:06:20.544082+01	2025-05-11 22:16:14.417521+01	2025-05-13 02:16:02.429562+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
6	2025-04-14 15:06:20.546239+01	2025-05-11 22:16:14.419909+01	2025-05-13 02:16:02.429562+01	Tablet	samsung table	399.99	15	\N	\N
7	2025-04-14 15:33:30.969868+01	2025-05-11 22:16:14.421371+01	2025-05-13 02:16:02.429562+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
8	2025-04-14 15:33:30.971063+01	2025-05-11 22:16:14.422556+01	2025-05-13 02:16:02.429562+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
29	2025-04-14 18:06:07.106591+01	2025-05-11 22:16:14.018878+01	2025-05-12 00:57:06.400436+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
32	2025-04-14 22:27:01.36307+01	2025-05-11 22:16:14.020735+01	2025-05-12 00:57:06.400436+01	Tablet	samsung table	399.99	15	\N	\N
33	2025-04-14 22:27:01.363522+01	2025-05-11 22:16:14.023315+01	2025-05-12 00:57:06.400436+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
54	2025-04-15 13:01:18.368698+01	2025-05-11 22:16:14.10758+01	2025-05-12 00:51:51.065292+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
55	2025-04-15 13:01:18.371331+01	2025-05-11 22:16:14.12+01	2025-05-12 00:51:51.065292+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
307	2025-05-09 19:40:08.158772+01	2025-05-11 22:16:14.473927+01	2025-05-12 00:53:14.297931+01	Deluxe %s home goods	Luxury edition of %s for the discerning customer home goods	82.79023689263198	38	20	\N
308	2025-05-09 19:40:08.15961+01	2025-05-11 22:16:14.47967+01	2025-05-12 00:53:14.297931+01	Basic %s home goods	Affordable %s that gets the job done home goods	15.082492690587323	45	20	\N
538	2025-06-08 00:14:59.944619+01	2025-06-08 00:15:00.560616+01	\N	Micro ordinateur Mini	Micro ordi	230	10	16	micro-ordinateur-mini-538
537	2025-06-07 23:50:25.24228+01	2025-08-08 19:33:01.737848+01	\N	Micro ordinateur Mini	Micro ordi	20	202	16	micro-ordinateur-mini-537
521	2025-05-18 16:22:21.990054+01	2025-08-08 19:33:53.553981+01	\N	Short white bottle 100ml	Short white bottle 100ml	230	450	2	boite-blanche-courtes-ronde-100ml-521
44	2025-04-14 23:18:44.345873+01	2025-05-11 22:16:14.066734+01	2025-05-12 00:56:15.763798+01	Tablet	samsung table	399.99	15	\N	\N
45	2025-04-14 23:18:44.346314+01	2025-05-11 22:16:14.068352+01	2025-05-12 00:56:15.763798+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
46	2025-04-15 01:34:48.509802+01	2025-05-11 22:16:14.070405+01	2025-05-12 00:56:15.763798+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
47	2025-04-15 01:34:48.512583+01	2025-05-11 22:16:14.073492+01	2025-05-12 00:56:15.763798+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
48	2025-04-15 01:34:48.51308+01	2025-05-11 22:16:14.07654+01	2025-05-12 00:56:15.763798+01	Tablet	samsung table	399.99	15	\N	\N
49	2025-04-15 01:34:48.513517+01	2025-05-11 22:16:14.078922+01	2025-05-12 00:56:15.763798+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
50	2025-04-15 12:35:12.205706+01	2025-05-11 22:16:14.081147+01	2025-05-12 00:56:15.763798+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
51	2025-04-15 12:35:12.207033+01	2025-05-11 22:16:14.083057+01	2025-05-12 00:56:15.763798+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
52	2025-04-15 12:35:12.207459+01	2025-05-11 22:16:14.084707+01	2025-05-12 00:56:15.763798+01	Tablet	samsung table	399.99	15	\N	\N
53	2025-04-15 12:35:12.207834+01	2025-05-11 22:16:14.086796+01	2025-05-12 00:56:15.763798+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
27	2025-04-14 18:06:07.105785+01	2025-05-11 22:16:14.410152+01	2025-05-12 00:57:06.400436+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
20	2025-04-14 17:00:17.391013+01	2025-05-11 22:16:13.979834+01	2025-05-12 00:58:20.744036+01	A third thing of the past	The thing has 20 stock	122.88	20	\N	\N
56	2025-04-15 13:01:18.371798+01	2025-05-11 22:16:14.12272+01	2025-05-12 00:51:51.065292+01	Tablet	samsung table	399.99	15	\N	\N
57	2025-04-15 13:01:18.372262+01	2025-05-11 22:16:14.127709+01	2025-05-12 00:51:51.065292+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
58	2025-04-15 13:13:34.570614+01	2025-05-11 22:16:14.155635+01	2025-05-12 00:51:51.065292+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
59	2025-04-15 13:13:34.572138+01	2025-05-11 22:16:14.205418+01	2025-05-12 00:51:51.065292+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
286	2025-05-09 19:07:01.470116+01	2025-05-11 22:16:14.482133+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	133.01613764294223	88	13	\N
276	2025-05-09 19:07:01.457231+01	2025-05-11 22:16:14.533112+01	2025-05-12 00:51:51.065292+01	Smart Premium %s electronics	High-quality %s for all your needs electronics	73.48638068816138	67	10	\N
60	2025-04-15 13:13:34.572721+01	2025-05-11 22:16:14.266092+01	2025-05-12 00:51:51.065292+01	Tablet	samsung table	399.99	15	\N	\N
61	2025-04-15 13:13:34.573309+01	2025-05-11 22:16:14.274014+01	2025-05-12 00:51:51.065292+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
62	2025-04-15 13:21:30.690172+01	2025-05-11 22:16:14.337642+01	2025-05-12 00:51:51.065292+01	Laptop	Del inspiron laptop	999.99	15	\N	\N
63	2025-04-15 13:21:30.692609+01	2025-05-11 22:16:14.381673+01	2025-05-12 00:51:51.065292+01	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
64	2025-04-15 13:21:30.693277+01	2025-05-11 22:16:14.383151+01	2025-05-12 00:51:51.065292+01	Tablet	samsung table	399.99	15	\N	\N
65	2025-04-15 13:21:30.693894+01	2025-05-11 22:16:14.384481+01	2025-05-12 00:51:51.065292+01	Headphone	Noise cancelling headphone	39.99	5	\N	\N
279	2025-05-09 19:07:01.462619+01	2025-05-11 22:16:14.405535+01	2025-05-12 00:51:51.065292+01	Premium %s home goods	High-quality %s for all your needs home goods	41.15208867327394	12	11	\N
522	2025-05-22 22:40:02.269262+01	2025-05-22 22:40:02.780421+01	\N	Chrome Pink Badass Press On Nails	faus Ongles	320	150	94	chrome-pink-badass-press-on-nails-522
306	2025-05-09 19:40:08.157785+01	2025-05-11 22:16:14.46848+01	2025-05-12 00:53:14.297931+01	Premium %s home goods	High-quality %s for all your needs home goods	40.75117943972307	48	20	\N
302	2025-05-09 19:40:08.084614+01	2025-05-11 22:16:14.623625+01	2025-05-12 00:53:14.297931+01	Basic %s books	Affordable %s that gets the job done books	9.825754084908102	58	18	\N
296	2025-05-09 19:40:08.048812+01	2025-05-11 22:16:14.637356+01	2025-05-12 00:53:14.297931+01	Basic %s electronics	Affordable %s that gets the job done electronics	23.84753556854904	83	16	\N
523	2025-05-23 02:51:20.762174+01	2025-05-23 02:51:21.361448+01	\N	Rouge a levre Aglais	Rouge a levre pour les grande dame	5000	50	94	rouge-a-levre-aglais-523
297	2025-05-09 19:40:08.050747+01	2025-05-11 22:16:14.656441+01	2025-05-12 00:53:14.297931+01	Premium %s home goods	High-quality %s for all your needs home goods	97.50966836987845	68	17	\N
5	2025-04-14 15:06:20.545609+01	2025-05-11 22:16:14.625834+01	2025-05-13 02:16:02.429562+01	Iphone 16 promax	iPhone 16 pro max 256GB, gorilla screen	999.99	15	1	\N
300	2025-05-09 19:40:08.061155+01	2025-05-11 22:16:14.660006+01	2025-05-12 00:53:14.297931+01	Premium %s books	High-quality %s for all your needs books	32.745651767412475	31	18	\N
298	2025-05-09 19:40:08.051888+01	2025-05-11 22:16:14.661657+01	2025-05-12 00:53:14.297931+01	Deluxe %s home goods	Luxury edition of %s for the discerning customer home goods	113.90022847091294	60	17	\N
524	2025-05-23 04:18:44.984943+01	2025-05-23 04:18:45.581395+01	\N	Rouge a levre tres chee	Rouge a levere	230	10	94	rouge-a-levre-tres-chee-524
303	2025-05-09 19:40:08.089954+01	2025-05-11 22:16:14.676103+01	2025-05-12 00:53:14.297931+01	Smart Premium %s electronics	High-quality %s for all your needs electronics	66.84751795557774	50	19	\N
2	2025-04-14 14:58:51.355988+01	2025-05-11 22:16:14.680537+01	\N	Phone	iPhone 16 pro 128 GB	699.99	15	\N	\N
301	2025-05-09 19:40:08.0802+01	2025-05-11 22:16:14.616657+01	2025-05-12 00:53:14.297931+01	Deluxe %s books	Luxury edition of %s for the discerning customer books	168.8244615974436	99	18	\N
299	2025-05-09 19:40:08.054362+01	2025-05-11 22:16:14.622092+01	2025-05-12 00:53:14.297931+01	Basic %s home goods	Affordable %s that gets the job done home goods	27.32304576781589	99	17	\N
526	2025-05-23 14:51:30.264585+01	2025-05-23 14:51:30.411965+01	\N	Ongle pour femmes panthere	Ongle pour femmes panthere	340	20	94	ongle-pour-femmes-panthere-526
528	2025-05-23 15:11:13.901328+01	2025-05-23 15:11:14.010528+01	\N	Chaine en or	Chaine en or	230	10	94	chaine-en-or-528
530	2025-05-23 15:20:19.908933+01	2025-05-23 15:20:20.008444+01	\N	Product 10	p 20	20	230	94	product-10-530
507	2025-05-11 22:16:13.881233+01	2025-08-06 05:42:26.558072+01	\N	Boite transparente - 200ml avec couvercle or ou argent	Boite transparente - 200ml avec couvercle en or, 	300	502	2	boite-transparente-200ml-avec-couvercle-or-ou-argent-507
258	2025-05-09 16:04:24.741358+01	2025-05-11 22:16:14.628441+01	2025-05-12 00:51:51.065292+01	Smart Premium %s electronics	High-quality %s for all your needs electronics	16.44679744847481	52	4	\N
295	2025-05-09 19:40:08.048033+01	2025-05-11 22:16:14.631467+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	60.118347856969535	70	16	\N
261	2025-05-09 16:04:24.746375+01	2025-05-11 22:16:14.634564+01	2025-05-12 00:51:51.065292+01	Premium %s home goods	High-quality %s for all your needs home goods	51.185586189325356	86	5	\N
260	2025-05-09 16:04:24.745193+01	2025-05-11 22:16:14.658189+01	2025-05-12 00:51:51.065292+01	Basic %s electronics	Affordable %s that gets the job done electronics	9.727144375794843	78	4	\N
275	2025-05-09 16:04:24.756363+01	2025-05-11 22:16:14.672684+01	2025-05-12 00:51:51.065292+01	Basic %s electronics	Affordable %s that gets the job done electronics	27.950782140213853	56	9	\N
294	2025-05-09 19:40:08.046216+01	2025-05-11 22:16:14.674274+01	2025-05-12 00:51:51.065292+01	Smart Premium %s electronics	High-quality %s for all your needs electronics	26.534162932754086	83	16	\N
270	2025-05-09 16:04:24.753342+01	2025-05-11 22:16:14.678343+01	2025-05-12 00:51:51.065292+01	Premium %s home goods	High-quality %s for all your needs home goods	96.56757826006933	58	8	\N
266	2025-05-09 16:04:24.750001+01	2025-05-11 22:16:14.605155+01	2025-05-12 00:51:51.065292+01	Basic %s books	Affordable %s that gets the job done books	18.52985780360997	83	6	\N
267	2025-05-09 16:04:24.751215+01	2025-05-11 22:16:14.607555+01	2025-05-12 00:51:51.065292+01	Smart Premium %s electronics	High-quality %s for all your needs electronics	72.06606940434192	16	7	\N
268	2025-05-09 16:04:24.751756+01	2025-05-11 22:16:14.609678+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	122.28099637906689	11	7	\N
264	2025-05-09 16:04:24.748752+01	2025-05-11 22:16:14.611695+01	2025-05-12 00:51:51.065292+01	Premium %s books	High-quality %s for all your needs books	55.93787710286016	56	6	\N
265	2025-05-09 16:04:24.749446+01	2025-05-11 22:16:14.613463+01	2025-05-12 00:51:51.065292+01	Deluxe %s books	Luxury edition of %s for the discerning customer books	104.61039979925332	57	6	\N
525	2025-05-23 14:39:50.234835+01	2025-05-23 14:39:52.842675+01	\N	Boite ronde et verte	Boite ronde et verte	270	500	2	boite-ronde-et-verte-525
527	2025-05-23 15:06:39.929673+01	2025-05-23 15:06:41.202358+01	\N	Greffes pour cheveux longs	Greffes pour cheveux	2800	10	94	greffes-pour-cheveux-longs-527
529	2025-05-23 15:14:52.874789+01	2025-05-23 15:14:52.930646+01	\N	Product 9	p9	20	20	94	product-9-529
531	2025-05-23 15:33:12.513649+01	2025-09-13 23:01:50.505339+01	\N	produit 21	produit 21	340	10	94	produit-21-531
532	2025-05-23 15:55:55.106071+01	2025-05-23 15:55:56.02148+01	\N	Produit 22	Produit 22	2450	40	94	produit-22-532
533	2025-05-23 16:05:12.279761+01	2025-05-23 16:05:12.766223+01	\N	Produit 23	Produit 23	230	50	94	produit-23-533
534	2025-05-23 16:10:50.335526+01	2025-05-23 16:10:50.624417+01	\N	produit 24	Produit 30	240	50	94	produit-24-534
535	2025-05-23 16:20:44.444732+01	2025-05-23 16:20:44.648291+01	\N	produit 28	Produit 28	220	20	94	produit-28-535
512	2025-05-11 22:16:13.904522+01	2025-08-08 20:51:52.171066+01	\N	short white botles 400ml	short white botles 400ml	199	39	2	boites-blanche-ecran-34-courtes-512
511	2025-05-11 22:16:13.886773+01	2025-08-06 13:55:56.565891+01	\N	Byphase, lait eclairsissant multi vitamine d1	Byphase, lait eclairsissant multi vitamine d1	930	88	11	byphase-lait-eclairsissant-multi-vitamine-d1-511
508	2025-05-11 22:16:13.882893+01	2025-09-12 01:33:41.843108+01	\N	Container for pomade 400ml	Container for pomade 400ml	250	500	21	container-for-pomade-400ml-3-508
509	2025-05-11 22:16:13.883807+01	2025-08-07 11:21:21.589137+01	\N	Short white boxes 300ml	Short white boxes 300ml	250	100	9	9-boites-courtes-300ml33-509
510	2025-05-11 22:16:13.884882+01	2025-07-30 21:29:23.581368+01	\N	Byphase lait de beauté ultra cool sport	Byphase lait de beauté ultra cool sport	22070	44	15	byphase-lait-de-beaut-ultra-cool-sport-510
277	2025-05-09 19:07:01.460445+01	2025-05-11 22:16:14.407472+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	142.6520347097213	81	10	\N
278	2025-05-09 19:07:01.461093+01	2025-05-11 22:16:14.40885+01	2025-05-12 00:51:51.065292+01	Basic %s electronics	Affordable %s that gets the job done electronics	8.41458854665902	51	10	\N
280	2025-05-09 19:07:01.465101+01	2025-05-11 22:16:14.413166+01	2025-05-12 00:51:51.065292+01	Deluxe %s home goods	Luxury edition of %s for the discerning customer home goods	193.51790888252407	39	11	\N
281	2025-05-09 19:07:01.465834+01	2025-05-11 22:16:14.414395+01	2025-05-12 00:51:51.065292+01	Basic %s home goods	Affordable %s that gets the job done home goods	23.558775710920308	104	11	\N
282	2025-05-09 19:07:01.467101+01	2025-05-11 22:16:14.534736+01	2025-05-12 00:51:51.065292+01	Premium %s books	High-quality %s for all your needs books	45.92780153595212	88	12	\N
283	2025-05-09 19:07:01.467702+01	2025-05-11 22:16:14.536595+01	2025-05-12 00:51:51.065292+01	Deluxe %s books	Luxury edition of %s for the discerning customer books	170.66906259910408	34	12	\N
284	2025-05-09 19:07:01.468387+01	2025-05-11 22:16:14.556311+01	2025-05-12 00:51:51.065292+01	Basic %s books	Affordable %s that gets the job done books	8.202669387648811	66	12	\N
293	2025-05-09 19:07:01.475446+01	2025-05-11 22:16:14.558623+01	2025-05-12 00:51:51.065292+01	Basic %s electronics	Affordable %s that gets the job done electronics	24.28707052718245	95	15	\N
287	2025-05-09 19:07:01.470642+01	2025-05-11 22:16:14.566516+01	2025-05-12 00:51:51.065292+01	Basic %s electronics	Affordable %s that gets the job done electronics	22.660508678502083	109	13	\N
285	2025-05-09 19:07:01.469559+01	2025-05-11 22:16:14.573912+01	2025-05-12 00:51:51.065292+01	Smart Premium %s electronics	High-quality %s for all your needs electronics	24.4552588347017	106	13	\N
290	2025-05-09 19:07:01.472929+01	2025-05-11 22:16:14.576144+01	2025-05-12 00:51:51.065292+01	Basic %s home goods	Affordable %s that gets the job done home goods	22.254650863082915	74	14	\N
291	2025-05-09 19:07:01.474145+01	2025-05-11 22:16:14.580509+01	2025-05-12 00:51:51.065292+01	Premium %s electronics	High-quality %s for all your needs electronics	37.73941064402397	20	15	\N
292	2025-05-09 19:07:01.474765+01	2025-05-11 22:16:14.583407+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	163.4610850239502	93	15	\N
288	2025-05-09 19:07:01.471822+01	2025-05-11 22:16:14.424504+01	2025-05-12 00:51:51.065292+01	Premium %s home goods	High-quality %s for all your needs home goods	45.124870276217926	17	14	\N
289	2025-05-09 19:07:01.472418+01	2025-05-11 22:16:14.426101+01	2025-05-12 00:51:51.065292+01	Deluxe %s home goods	Luxury edition of %s for the discerning customer home goods	177.7378146393984	38	14	\N
259	2025-05-09 16:04:24.744582+01	2025-05-11 22:16:14.615104+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	78.05821959366378	29	4	\N
269	2025-05-09 16:04:24.752281+01	2025-05-11 22:16:14.618331+01	2025-05-12 00:51:51.065292+01	Basic %s electronics	Affordable %s that gets the job done electronics	23.828264127150803	43	7	\N
272	2025-05-09 16:04:24.754373+01	2025-05-11 22:16:14.620178+01	2025-05-12 00:51:51.065292+01	Basic %s home goods	Affordable %s that gets the job done home goods	19.88450776224237	28	8	\N
262	2025-05-09 16:04:24.746962+01	2025-05-11 22:16:14.663589+01	2025-05-12 00:51:51.065292+01	Deluxe %s home goods	Luxury edition of %s for the discerning customer home goods	118.66740889332306	31	5	\N
263	2025-05-09 16:04:24.747582+01	2025-05-11 22:16:14.665547+01	2025-05-12 00:51:51.065292+01	Basic %s home goods	Affordable %s that gets the job done home goods	26.750089729513228	108	5	\N
273	2025-05-09 16:04:24.755407+01	2025-05-11 22:16:14.667764+01	2025-05-12 00:51:51.065292+01	Premium %s electronics	High-quality %s for all your needs electronics	76.04057235578297	69	9	\N
274	2025-05-09 16:04:24.755841+01	2025-05-11 22:16:14.669273+01	2025-05-12 00:51:51.065292+01	Deluxe %s electronics	Luxury edition of %s for the discerning customer electronics	135.36774151835414	22	9	\N
271	2025-05-09 16:04:24.753855+01	2025-05-11 22:16:14.671035+01	2025-05-12 00:51:51.065292+01	Deluxe %s home goods	Luxury edition of %s for the discerning customer home goods	126.14157081285074	53	8	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.roles (id, created_at, updated_at, deleted_at, name, description) FROM stdin;
1	2025-04-14 22:27:01.364678+01	2025-04-14 22:27:01.364678+01	\N	SuperAdmin	Full access
2	2025-04-14 22:27:01.365554+01	2025-04-14 22:27:01.365554+01	\N	Admin	Manage products and users
4	2025-04-14 22:27:01.36678+01	2025-04-14 22:27:01.36678+01	\N	Visitor	View products and place orders
5	2025-09-12 20:52:26.475479+01	2025-09-12 20:52:26.475479+01	\N	ShopManager	Can create update and delete a new shop.
3	2025-04-14 22:27:01.366106+01	2025-09-14 00:05:14.414922+01	\N	Sales	View some products and sales data 2
\.


--
-- Data for Name: shop_employees; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.shop_employees (user_id, shop_id) FROM stdin;
1	2
\.


--
-- Data for Name: shops; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.shops (id, created_at, updated_at, deleted_at, name, description, owner_id, moto, slug) FROM stdin;
6	2025-05-09 16:04:24.748174+01	2025-05-09 16:04:24.748174+01	\N	Book Nook	A wonderful shop specializing in Book Nook	2	Where stories come alive	\N
2	2025-04-15 15:48:57.081206+01	2025-05-15 23:50:48.916647+01	\N	Otantic Packaging 2	Vente de boites pour produits de beauté	1	Des Emballages de  qualité, pour vous rendre heureuse	\N
11	2025-05-09 19:07:01.461717+01	2025-05-09 19:07:01.461717+01	\N	Fashion Forward	A wonderful shop specializing in Fashion Forward	1	Style that speaks for you	\N
12	2025-05-09 19:07:01.466465+01	2025-05-09 19:07:01.466465+01	\N	Book Nook	A wonderful shop specializing in Book Nook	2	Where stories come alive	\N
14	2025-05-09 19:07:01.471214+01	2025-05-09 19:07:01.471214+01	\N	Home Essentials	A wonderful shop specializing in Home Essentials	2	Comfort starts at home	\N
18	2025-05-09 19:40:08.059924+01	2025-05-09 19:40:08.059924+01	\N	Book Nook	A wonderful shop specializing in Book Nook	2	Where stories come alive	\N
19	2025-05-09 19:40:08.087853+01	2025-05-09 19:40:08.087853+01	\N	Gadget Galaxy	A wonderful shop specializing in Gadget Galaxy	2	Future in your hands	\N
20	2025-05-09 19:40:08.156807+01	2025-05-09 19:40:08.156807+01	\N	Home Essentials	A wonderful shop specializing in Home Essentials	2	Comfort starts at home	\N
17	2025-05-09 19:40:08.049698+01	2025-05-16 23:29:56.120884+01	\N	Fashion Forward2	A wonderful shop specializing in Fashion Forward	1	Style that speaks for you	fashion-forward2-17
93	2025-05-22 05:09:45.505572+01	2025-05-22 05:15:51.299493+01	\N	Tech guru	We sell all sort of tech stuff	3	all the best teech for you	tech-guru-93
16	2025-05-09 19:40:08.04396+01	2025-06-07 03:04:01.924496+01	\N	Tech Haven 165	A wonderful shop specializing in Tech Haven	1	Your one-stop tech  1	tech-haven-165-16
3	2025-04-15 15:49:45.424123+01	2025-05-13 06:25:43.760841+01	2025-06-10 15:55:29.33131+01	Quincaillerie du Rodeo	Vente de matéreaux de construction.	1	\N	\N
10	2025-05-09 19:07:01.455707+01	2025-05-09 19:07:01.455707+01	2025-06-10 15:56:37.232709+01	Tech Haven	A wonderful shop specializing in Tech Haven	1	Your one-stop tech shop	\N
1	2025-04-15 15:46:00.232926+01	2025-04-15 15:46:00.232926+01	2025-06-10 15:57:08.227723+01	Tech Haven	Electronics store	1	\N	\N
4	2025-05-09 16:04:24.73871+01	2025-05-16 23:19:45.10968+01	2025-06-10 16:12:51.735405+01	Tech Havenw	A wonderful shop specializing in Tech Haven	1	Your one-stop tech shop	tech-havenw-4
95	2025-08-08 21:53:34.355602+01	2025-08-08 21:53:34.355602+01	\N	A test shop 0808	A test shop 0808	29	A moto	a-test-shop-0808-
97	2025-08-08 22:00:34.034833+01	2025-08-08 22:00:34.034833+01	\N	A user shop		29		a-user-shop-
99	2025-08-10 11:58:18.058358+01	2025-08-10 11:58:18.153855+01	\N	Churchill training shop	Churchill training shop	33	Churchill training shop	churchill-training-shop-99
21	2025-05-09 19:40:08.160291+01	2025-09-12 01:33:41.842645+01	\N	Otantic Packeding	A wonderful shop specializing in Otantic Packeding	2	Des Emballages de  qualité, pour vous rendre heureuse	otantic-packeding-21
94	2025-05-22 22:35:12.964881+01	2025-09-13 23:01:50.50073+01	\N	La Belle Étoile	Votre éclat, notre passion, La Belle Étoile	3	Votre éclat, notre passion	la-belle-toile-94
5	2025-05-09 16:04:24.745759+01	2025-05-13 06:24:56.719326+01	\N	Fashion Forward	A wonderful shop specializing in Fashion Forward	1	Style that speaks for you	\N
7	2025-05-09 16:04:24.750579+01	2025-05-13 06:40:51.952485+01	\N	Gadget Galaxy	A wonderful shop specializing in Gadget Galaxy	2	Future in your hands	\N
8	2025-05-09 16:04:24.752765+01	2025-05-13 06:42:55.917008+01	\N	Home Essentials	A wonderful shop specializing in Home Essentials	2	Comfort starts at home	\N
15	2025-05-09 19:07:01.473468+01	2025-05-13 16:45:38.866351+01	\N	Otantic Packeding	A wonderful shop specializing in Otantic Packeding	2	Des Emballages de  qualité, pour vous rendre heureuse	\N
13	2025-05-09 19:07:01.468946+01	2025-05-13 16:47:20.382755+01	\N	Gadget Galaxy	A wonderful shop specializing in Gadget Galaxy	2	Future in your hands	\N
98	2025-08-08 22:15:49.738709+01	2025-08-08 22:15:49.759567+01	\N	A fresh products shop	A fresh products shop	29	A fresh products shop	a-fresh-products-shop-98
9	2025-05-09 16:04:24.754857+01	2025-05-13 06:14:29.230132+01	\N	Otantic Packeding	A wonderful shop specializing in Otantic Packeding	2	Des Emballages de  qualité, pour vous rendre heureuse	\N
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.user_roles (user_id, role_id) FROM stdin;
1	1
2	2
3	1
4	4
7	4
10	3
11	1
12	2
12	3
12	4
13	2
13	3
13	4
14	2
15	2
16	2
17	3
17	2
4	2
10	1
3	2
3	3
3	4
18	2
18	3
19	3
19	4
20	2
20	3
21	2
21	3
22	3
22	2
28	2
28	3
28	4
23	3
23	4
24	4
25	2
25	3
26	2
27	2
29	4
33	4
34	4
35	4
36	4
37	4
38	4
39	4
40	4
2	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pasjtene
--

COPY public.users (id, created_at, updated_at, deleted_at, username, email, first_name, last_name, password, refresh_token, refresh_expiry, pin, is_verified, verify_token, verify_expiry, reset_pw_token, reset_pw_expiry) FROM stdin;
22	2025-05-06 22:40:10.534964+01	2025-05-06 22:40:10.534964+01	\N	pasjtene1739@yahoo.co.uk	pasjtene1739@yahoo.co.uk	Pascal-1739	Tene	$2a$10$ewTC60YfS.LyQq9mQuIhS.GlumclCWXoskTSDI1RRv.iAWo.O17Om		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
19	2025-05-06 21:49:24.772424+01	2025-05-06 22:02:32.665654+01	\N	pasjtene1649@yahoo.co.uk	pasjtene1649@yahoo.co.uk	Pascal-2	Tene	$2a$10$h4w1tandgkG8oha8bvRrReTSFS0aX7dnpUjLb348qlLFj684qOS4y		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
28	2025-05-06 23:15:20.081862+01	2025-05-06 23:17:03.590078+01	\N	pasjtene1815@yahoo.co.uk	pasjtene1815@yahoo.co.uk	Pascal-15	Tene-13	$2a$10$1KXx50Ku.uBbRvPbQFCRI.MyGG235FiNlYclfiMQRlYEZY0az.mWy	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDcxNzQ2MjMsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6Mjh9.vQwmDwpnejoeiP5IA-ZmN8MK41IBNDHE1fHADuq4rIc	2025-05-13 23:17:03.5892+01	\N	f	\N	\N	\N	\N
23	2025-05-06 22:47:11.652628+01	2025-05-06 23:18:23.200135+01	\N	pasjtene1746@yahoo.co.uk	pasjtene1746@yahoo.co.uk	Pascal-1746	Tene	$2a$10$TKDMq6nehb7bnY6Fqf95YOT6YNXxqV.ROy8FLofYDwKoCOcLkauFi		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
12	2025-04-24 19:25:31.008952+01	2025-04-24 19:25:31.008952+01	\N	pasjtene7	dave3@example.com	Dave3 Ivan3	Jondzo spider man 	$2a$10$ARkqOhp7eh3RFjppoAV.s.kbwzZ1d5PKLDo4v/.MpIu9CAUgOgwS6		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
13	2025-04-24 19:26:10.083702+01	2025-04-24 19:26:10.083702+01	\N	pasjtene8	dylan@example.com	Dylan	W Jondzo 	$2a$10$EvKbKMf7q4Ik2TjCvtT5..CX1cgwMItd3dDT/vMx9dpagWp2vFnKG		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
3	2025-04-15 22:51:01.786138+01	2025-08-06 08:54:23.122409+01	\N	pasjtene2	pasjtene2@example.com	Pascal 4	Jondzo Tene JT	$2a$10$HEkv/GHmcW64dgmadl7PX.vueDPEy8qjVvRXeHb81LMTsJck6dHcC	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTUwNzE2NjMsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6M30.92Wp-FXLdvbw-hRK4To4rC44CCSLkgdnEyzvW7SiJ88	2025-08-09 14:28:46.705813+01	0	f	\N	\N	\N	\N
7	2025-04-15 22:54:09.743621+01	2025-04-29 00:55:22.603736+01	\N	jayden2	jayden2@example.com	Jayden	Jondzo Tene 34	$2a$10$Ab/FJOuG.DjIUurBTPx7feKYKMthrogknaGBLdJF8R9T5eHR7PVNu		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
16	2025-04-24 19:27:35.653503+01	2025-09-12 15:58:06.19207+01	\N	pasjtene11	brian2@example.com	Brian2	Tene2 Jondzo2 qw ry Paul	$2a$10$xuJS8CkpSbA2dCJk5x3L8OTCpN7nNmiSHs1UrPWDB/Rfm1wSXdnYi		0001-01-01 00:13:35+00:13:35	0	f		0001-01-01 00:00:00		0001-01-01 00:13:35+00:13:35
27	2025-05-06 23:14:31.246173+01	2025-05-15 01:46:31.173604+01	\N	pasjtene1814@yahoo.co.uk	pasjtene1814@yahoo.co.uk	Pascal	Tene	$2a$10$Bf5HArjdGiCaLLfwU4/VsunJIBnVjYXRjlTBTahJk2bukYiQ9SLru		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
15	2025-04-24 19:27:13.003709+01	2025-04-29 00:56:35.991064+01	\N	pasjtene10	brian@example.com	Brian tene	Tene Jondzo erer	$2a$10$QzY9wcUretDAAhgrRvsO6uvmoyMyr7dkTozC.TVgzCpNqMWDw8GHa		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
17	2025-04-28 19:09:11.539052+01	2025-04-29 01:07:39.84317+01	\N	pasjtene13	jayden13@example.com	Jayden 131	Jondzo Tene 13	$2a$10$cevnmZtP/7KSo0jIG8r2LO1UBqrXAUQjyu6klarXzv8eHer.LOGIS		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
10	2025-04-24 19:23:08.469631+01	2025-04-30 13:52:22.480933+01	\N	pasjtene5	dave@example.com	Dave Ivan JT	Jondzo spider man34 23	$2a$10$vtwGA..EJ3t6Zvtb2CyyO.BUMAjW6QFoR4tUbuNd.T/bKqT5tdF1e		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
18	2025-05-06 21:48:39.037856+01	2025-05-06 22:29:11.794085+01	\N	pasjtene1638@yahoo.co.uk	pasjtene1638@yahoo.co.uk	Pascal-16-38	Tene--16-40	$2a$10$tk28vuHaH0GWrIBrUbB0XemljwQ/a8erI6jIpDA.bQJB3xRemzePi		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
4	2025-04-15 22:53:28.091061+01	2025-04-29 01:10:57.497183+01	\N	jayden	jayden@example.com	Jayden Desordre	Jondzo Tene	$2a$10$sO20pbhNEIEV30V/XHE1xue3/6igIPx2nsfMtvpLeTi4lyoO5er8m		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
14	2025-04-24 19:26:35.924737+01	2025-04-29 07:30:41.124542+01	\N	pasjtene9	dylan2@example.com	Dylan2	Wilder Jondzo Tene	$2a$10$v.adf7z03wYqd4tIrfjpAOd3rT1ErlC.2crTwrEFZxgNqggNpKg.G		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
20	2025-05-06 22:29:54.728673+01	2025-05-06 22:29:54.728673+01	\N	pasjtene1729@yahoo.co.uk	pasjtene1729@yahoo.co.uk	Pascal-17-29	Tene-1729	$2a$10$i0wamY/rWqwY3lNoOgwrheuS2RAmyf506R0DIM54NJLahxHUY8EeW		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
11	2025-04-24 19:23:46.732682+01	2025-04-30 13:52:50.123879+01	\N	pasjtene6	dave2@example.com	Dave2 Ivan2 Dont Juan	Jondzo spider 2330 45	$2a$10$iNiOFAQ8/SriW5hvS1Kj0eh1HFNALUv5CqYUsvQa38GE9TJ6h9aTC		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
21	2025-05-06 22:38:58.29331+01	2025-05-06 22:39:33.224341+01	\N	pasjtene1738@yahoo.co.uk	pasjtene1738@yahoo.co.uk	Pascal-1738	Tene	$2a$10$qMLbaDZ.EbYkL4jgCppQiet4Ee5oVHqb8afYhsqcIqSxJpr7A1GAW		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
24	2025-05-06 22:59:40.713313+01	2025-05-06 23:18:42.287759+01	\N	pasjtene1759@yahoo.co.uk	pasjtene1759@yahoo.co.uk	Pascal-1759	Tene	$2a$10$LqgJaTk971MZdfPuBP9GP.Xh3P/RyjPHYMWpYYggRxbsmDlObrpVi		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
25	2025-05-06 23:06:05.797537+01	2025-05-06 23:18:50.792729+01	\N	pasjtene1805@yahoo.co.uk	pasjtene1805@yahoo.co.uk	Pascal-1805	Tene	$2a$10$KSs.F9IjSEzv8yuEDoPz9enSayLUavVPMsfmG8FpkWi2IRFi0oTtW		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
34	2025-08-09 23:09:18.25664+01	2025-08-10 11:41:23.300328+01	\N	pasjtene2@yahoo.co.uk	pasjtene2@yahoo.co.uk	Pasjtene2	Institute	$2a$10$h8wpIGjTxyd6aQfuA5l8sO.tBMaYK4/nwIgH.DpMxmmjXcYaWOBse	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU0MjcyODMsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6MzR9.BU2IDiwO2YrJbl3qEyAlldnOocW_WZ48vsL1GwRot6Y	2025-08-17 11:41:23.29994+01	0	f	\N	\N	\N	\N
26	2025-05-06 23:12:16.400976+01	2025-05-06 23:24:44.676421+01	\N	pasjtene1812@yahoo.co.uk	pasjtene1812@yahoo.co.uk	Pascal-18-12	Tene	$2a$10$Q9lBLWrVOneEj1mFixHuluOy3JMELCbNiYccmjM/u03aCT6N3cwbq		0001-01-01 00:13:35+00:13:35	\N	f	\N	\N	\N	\N
35	2025-08-10 15:40:36.066744+01	2025-08-10 15:40:36.236312+01	\N	cticameroun22@gmail.com	cticameroun22@gmail.com	Pascal	Tene	$2a$10$.SR8rU0nYObFfShqyekuleuvHN7Cn6lnEZuayk9HEyS1uHgt.TU12	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU0NDE2MzYsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6MzV9.gefAlHpZCFnY1JezVF6InAFRP-NNBXJR7x7LOLFs40s	2025-08-17 15:40:36.236021+01	0	f	\N	\N	\N	\N
29	2025-08-08 19:32:30.397123+01	2025-08-16 15:04:33.67457+01	\N	cticameroun@gmail.com	cticameroun@gmail.com	Churchill	Institute	$2a$10$7IXlSHN9AXM7rTsxbAeIgevODsvWVa6upDI2BAsB9GP59eoUNz.ny	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTUzNzg5NzQsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6Mjl9.QNbIpDqi0WjN3NRHebZ-fG93zjsR23nsJ2lYneZbpjQ	2025-08-16 22:16:14.129778+01	0	f		0001-01-01 00:00:00	7upx3E6YBt8I0LV1s9dYmSjF23HNm6XHJBnLvHZND02k21Ysn8R3zS0OEL4mZx4b	2025-08-16 16:04:33.666857+01
33	2025-08-09 22:17:37.589221+01	2025-08-10 11:58:17.991595+01	\N	cticameroun2@gmail.com	cticameroun2@gmail.com	Churchill2	Institute	$2a$10$Dyp1tqsLvl9Hai9.RyRRU.FlU6P80C60wwvjuD8d.WeqtAKfSgn/.	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU0MjgyOTcsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6MzN9.URuO3YzUzNX54U6nr74r5OZeiNPW4gPUwMYhKYY2des	2025-08-17 11:57:27.526687+01	0	f	\N	\N	\N	\N
36	2025-08-17 13:03:07.352523+01	2025-08-17 13:05:16.337705+01	\N	pasjtene@yahoo.co.uk	pasjtene@yahoo.co.uk	Pascal	Tene	$2a$10$hS6zdWk.WkfZ.9DrdhtXLusMA8JNeB802VD19MQ/2XylNqTNb0Awa		0001-01-01 00:13:35+00:13:35	0	f	jnjmWWCH4RaPzHN94UMVkbr4hcjVm3fOwxEmI4LAVpjK1fYE5jIo4bGBzHASji9q	2025-08-18 13:05:16.334674		0001-01-01 00:13:35+00:13:35
37	2025-08-17 15:11:39.473391+01	2025-08-17 15:11:39.473391+01	\N	pasjtene1q@yahoo.co.uk	pasjtene1q@yahoo.co.uk	Pascal	Tene	$2a$10$wxk0AokfK4LrkMhfd/RhXuWstXyq9JW.ihZjfnAezOG9lPwrjzsPq		0001-01-01 00:13:35+00:13:35	0	f	4CLk7sOMFkjZx4BnGwFNKPDu7Dn60B9libEJzyn0fHDQ0ZWDVFYqcpXxgo6z1YRs	2025-08-18 15:11:39.313735		0001-01-01 00:13:35+00:13:35
38	2025-08-17 15:44:01.949917+01	2025-08-17 15:44:01.949917+01	\N	pasjteneqw@yahoo.co.uk	pasjteneqw@yahoo.co.uk	Pascal	Tene	$2a$10$dULhpock01aCya3Irr4NYOoF9dXnwlZoE7eGZ3rEmpFaSwBPR2xK2		0001-01-01 00:13:35+00:13:35	0	f	JAM2puJfZj1uOdawinDaijHqAR6sQkSvtzo1Sa8Wq4nGrizHnM3aFFYft3ftOpW1	2025-08-18 15:44:01.84923		0001-01-01 00:13:35+00:13:35
39	2025-08-17 16:17:49.237678+01	2025-08-17 16:17:49.237678+01	\N	pasjtene12w@yahoo.co.uk	pasjtene12w@yahoo.co.uk	Pascal	Tene	$2a$10$mlLaH6IRPamJF5Lyad0JIeyMpLQFt2gss7q8oCM22rs/r1AJeIHli		0001-01-01 00:13:35+00:13:35	0	f	YOH83fsP3uODJ572hApbOxE2oj6ajRkeQUcbBNHGyOOEdwiZSkNpU7FdXZfRITsr	2025-08-18 16:17:49.090472		0001-01-01 00:13:35+00:13:35
40	2025-08-17 16:28:03.936074+01	2025-08-17 16:28:03.936074+01	\N	pasjtene@2yahoo.co.uk	pasjtene@2yahoo.co.uk	Pascal	Tene	$2a$10$fdeAzlYOPXgEkpoaW29QJORGDYYHKuE1t4877RKl0bs162TGFWzKa		0001-01-01 00:13:35+00:13:35	0	f	xPd45UzvYYoOwfnRJsJ1euforCQJmlJpsiU5Diev8GNqNFZh3q9s39yDXcbBsYJs	2025-08-18 16:28:03.795763		0001-01-01 00:13:35+00:13:35
2	2025-04-15 22:48:13.578659+01	2025-09-12 15:56:25.496472+01	\N	pasjtene	pasjtene@example2.com	Pascal	Tene 67 67 68 69 90	$2a$10$rmzqevgfmx4f3ypgudZh2.rIAavM3ICQEg9hSujBBZCivxork6F7S	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDYwOTA1MzcsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6Mn0.sc3skw4bzhWsJxsM1qn1LCrOMHTQmwLXOtZ3igWFRe0	2025-05-01 10:08:57.176724+01	0	f		0001-01-01 00:00:00		0001-01-01 00:13:35+00:13:35
1	2025-04-14 22:27:01.422787+01	2025-09-15 11:48:17.584749+01	\N	superadmin	superadmin@example.com	System	Administrator	$2a$10$qWOm3JQ.TEX3QWmIcMWSgOEj3qwvMrll9iEk9pctfd6.Suy8Kz5lO	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTg1MzgwOTcsInR5cGUiOiJyZWZyZXNoIiwidXNlcl9pZCI6MX0.2HXRkbSzzdZunCTp9KlM_S2L5667lUPAE669K1PW9u0	2025-09-22 11:48:17.575121+01	0	t		0001-01-01 00:00:00		0001-01-01 00:13:35+00:13:35
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.categories_id_seq', 75, true);


--
-- Name: product_about_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tene
--

SELECT pg_catalog.setval('public.product_about_translations_id_seq', 14, true);


--
-- Name: product_abouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tene
--

SELECT pg_catalog.setval('public.product_abouts_id_seq', 8, true);


--
-- Name: product_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tene
--

SELECT pg_catalog.setval('public.product_details_id_seq', 14, true);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.product_images_id_seq', 34, true);


--
-- Name: product_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.product_translations_id_seq', 10, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.products_id_seq', 538, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: shops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.shops_id_seq', 99, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pasjtene
--

SELECT pg_catalog.setval('public.users_id_seq', 40, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: product_about_translations product_about_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_about_translations
    ADD CONSTRAINT product_about_translations_pkey PRIMARY KEY (id);


--
-- Name: product_abouts product_abouts_pkey; Type: CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_abouts
    ADD CONSTRAINT product_abouts_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (category_id, product_id);


--
-- Name: product_details product_details_pkey; Type: CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT product_details_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_translations product_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT product_translations_pkey PRIMARY KEY (id);


--
-- Name: product_translations product_translations_product_id_language_key; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT product_translations_product_id_language_key UNIQUE (product_id, language);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: shop_employees shop_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shop_employees
    ADD CONSTRAINT shop_employees_pkey PRIMARY KEY (user_id, shop_id);


--
-- Name: shops shops_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_pkey PRIMARY KEY (id);


--
-- Name: shops shops_slug_key; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_slug_key UNIQUE (slug);


--
-- Name: categories uni_categories_name; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT uni_categories_name UNIQUE (name);


--
-- Name: products uni_products_slug; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT uni_products_slug UNIQUE (slug);


--
-- Name: roles uni_roles_name; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uni_roles_name UNIQUE (name);


--
-- Name: users uni_users_email; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uni_users_email UNIQUE (email);


--
-- Name: users uni_users_username; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uni_users_username UNIQUE (username);


--
-- Name: product_about_translations unique_translation; Type: CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_about_translations
    ADD CONSTRAINT unique_translation UNIQUE (product_about_id, language);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_categories_deleted_at; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_categories_deleted_at ON public.categories USING btree (deleted_at);


--
-- Name: idx_product_images_deleted_at; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_product_images_deleted_at ON public.product_images USING btree (deleted_at);


--
-- Name: idx_products_deleted_at; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_products_deleted_at ON public.products USING btree (deleted_at);


--
-- Name: idx_products_description_trgm; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_products_description_trgm ON public.products USING gin (description public.gin_trgm_ops);


--
-- Name: idx_products_name_trgm; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_products_name_trgm ON public.products USING gin (name public.gin_trgm_ops);


--
-- Name: idx_roles_deleted_at; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_roles_deleted_at ON public.roles USING btree (deleted_at);


--
-- Name: idx_shops_deleted_at; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_shops_deleted_at ON public.shops USING btree (deleted_at);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: pasjtene
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: product_about_translations fk_product_about; Type: FK CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_about_translations
    ADD CONSTRAINT fk_product_about FOREIGN KEY (product_about_id) REFERENCES public.product_abouts(id) ON DELETE CASCADE;


--
-- Name: product_categories fk_product_categories_category; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: product_categories fk_product_categories_product; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_images fk_products_images; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fk_products_images FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: shop_employees fk_shop_employees_shop; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shop_employees
    ADD CONSTRAINT fk_shop_employees_shop FOREIGN KEY (shop_id) REFERENCES public.shops(id);


--
-- Name: shop_employees fk_shop_employees_user; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shop_employees
    ADD CONSTRAINT fk_shop_employees_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products fk_shops_products; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_shops_products FOREIGN KEY (shop_id) REFERENCES public.shops(id);


--
-- Name: user_roles fk_user_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles fk_user_roles_user; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: shops fk_users_owned_shops; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT fk_users_owned_shops FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: product_abouts product_abouts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_abouts
    ADD CONSTRAINT product_abouts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_details product_details_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tene
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT product_details_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_translations product_translations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pasjtene
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT product_translations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

