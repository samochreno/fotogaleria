import { defineStore } from "pinia";

export const usePostStore = defineStore('postStore', {
    state: () => ({
        'isFetching': false,
        'posts': [],
        'page': 0,
        'lastPage': 0,
        'id': null,
    }),
    getters: {
        post: (state) => state.posts.find((p) => p.id == state.id),
    },
    actions: {
        refetch() {
            if (this.isFetching) {
                return;
            }

            this.id = null;
            this.page = 0;
            this.posts = [];

            this.fetch();
        },
        fetch() {
            const canFetchMore = this.page == 0 || this.page != this.lastPage;
            if (this.isFetching || !canFetchMore) {
                return;
            }

            this.page++;
            this.lastPage = 0;
            this.isFetching = true;

            if (this.page == 1) {
                document.body.style.overflow = "hidden";
            }

            axios
                .get(`/posts/index?page=${this.page}`)
                .then((res) => {
                    const data = res.data;
                    console.log(data);

                    let posts = this.page == 1 ? [] : this.posts;
                    posts.push(...data.posts.data);

                    this.posts = posts;
                    this.isFetching = false;
                    this.lastPage = data.posts.last_page;

                    document.body.style.removeProperty("overflow");
                })
                .catch((err) => {
                    console.error(err);
                    this.isFetching = false;
                });
                
        },
        updatePost(values) {
            console.assert(this.id);


            let posts = this.posts;

            const oldPost = posts.find((p) => p.id == this.id)

            let newPost = { ...oldPost };
            Object.entries(values).forEach((entry) => {
                const [key, value] = entry;
                newPost[key] = value;
            });

            posts[posts.findIndex((p) => p.id == this.id)] = newPost;
            this.posts = posts;
        },
    },
});
