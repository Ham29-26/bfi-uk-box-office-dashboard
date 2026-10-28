function Header(props) {

    return(
        <header>
            <h1>{props.title}</h1>
            <p>{props.subtitle}</p>

            <p className="update-notice">
                New updates every Wednesday!
            </p>
        </header>
    )
}

export default Header