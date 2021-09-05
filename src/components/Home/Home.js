import React, {Component} from 'react'
import { API_KEY, API_URL, IMAGE_BASE_URL, POSTER_SIZE, BACKDROP_SIZE } from '../../config'
import HeroImage from '../elements/HeroImage/HeroImage'
import MovieThumb from '../elements/MovieThumb/MovieThumb'
import SearchBar from '../elements/SearchBar/SearchBar'
import FourColGrid from '../elements/FourColGrid/FourColGrid'
import LoadMoreBtn from '../elements/LoadMoreBtn/LoadMoreBtn'
import Spinner from '../elements/Spinner/Spinner'
import './Home.css'

class Home extends Component {
    state = {
        movies: [],
        heroImage: null,
        loading: false,
        currentPage: 0,
        totalPages: 0,
        searchTerm: ''
    }
    
    componentDidMount() {
        if (localStorage.getItem("HomeState")) {
            const state = JSON.parse(localStorage.getItem("HomeState"))
            this.setState({...state})
        } else {
            this.setState({loading: true})
            // const endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`
            this.fetchItems(this.createEndpoint("movie/popular",false,""))
        } 
    }

    createEndpoint = (type, loadMore, searchTerm) => {
        return `${API_URL}${type}?api_key=${API_KEY}&language=en-US&page=${loadMore && this.state.currentPage + 1}&query=${searchTerm}`
    }

    updateItems = (loadMore, searchTerm) => {
        this.setState({
            movies: loadMore ? [...this.state.movies] : [],
            loading: true,
            searchTerm: loadMore ? this.state.searchTerm : searchTerm
        }, () => {
            this.fetchItems(!this.state.searchTerm ? this.createEndpoint("movie/popular", loadMore, "") : this.createEndpoint("search/movie", loadMore, this.state.searchTerm))
        })
    }

    // searchItems = (searchTerm) => {
    //     let endpoint = ''
    //     this.setState({
    //         movies: [],
    //         loading: true,
    //         searchTerm
    //     })

    //     if (searchTerm === '') {
    //         endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`
    //     } else {
    //         endpoint = `${API_URL}search/movie?api_key=${API_KEY}&language=en-US&query=${this.state.searchTerm}`
    //     }

    //     this.fetchItems(endpoint)
    // }

    // loadMoreItems = () => {
    //     let endpoint = ''
    //     this.setState({loading: true})

    //     if (this.state.searchTerm === '') {
    //         endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=${this.state.currentPage + 1}`
    //     } else {
    //         endpoint = `${API_URL}search/movie?api_key=${API_KEY}&language=en-US&query=${this.state.searchTerm}&page=${this.state.currentPage + 1}`
    //     }

    //     this.fetchItems(endpoint)
    // }

    fetchItems = async endpoint => {
        const {movies, searchTerm} = this.state
        const result = await(await fetch (endpoint)).json()
        try {
            this.setState({
                movies: [...movies, ...result.results],
                heroImage: result.results[0],
                loading: false,
                currentPage : result.page,
                totalPages: result.total_pages
            }, () => {
                if (searchTerm === "") {
                    localStorage.setItem("HomeState", JSON.stringify(this.state))
                }           
            })
        }
        catch (e) {
            console.log("There was an error: ", e)
        }
    }

    // fetchItems = (endpoint) => {
    //     fetch(endpoint).then(result => result.json()).then(result => {
    //         this.setState({
    //             movies: [...this.state.movies, ...result.results],
    //             heroImage: this.state.heroImage || result.results[0],
    //             loading: false,
    //             currentPage : result.page,
    //             totalPages: result.total_pages
    //         }, () => {
    //             localStorage.setItem("HomeState", JSON.stringify(this.state))
    //         })
    //     })
    // }

    render() {
        const { movies, heroImage, loading, currentPage, totalPages, searchTerm } = this.state
        return (
            <div className="rmdb-home">
                {heroImage ?
                    <div>
                        <HeroImage image={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${heroImage.backdrop_path}`} title={heroImage.original_title} text={heroImage.overview}/>
                        <SearchBar callback={this.updateItems}/>
                    </div> 
                : null}
                <div className="rmdb-home-grid">
                    <FourColGrid header={searchTerm ? 'Search Result' : 'Popular Movies'} loading={loading}>
                        {movies.map((element, i) => {
                            return <MovieThumb key={i} clickable={true} image={element.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE}${element.poster_path}` : './images/no_image.jpg'} movieId={element.id} movieName={element.title}/>
                        })}
                    </FourColGrid>
                    {loading ? <Spinner/> : null}
                    {(currentPage < totalPages && !loading) ? <LoadMoreBtn text="Load More" onClick={this.updateItems}/> : null}
                </div>
            </div>
        ) 
    }
}

export default Home