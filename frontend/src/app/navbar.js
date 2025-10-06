const Navbar = () => { // Adapted from https://medium.com/@a.pirus/how-to-create-a-responsive-navigation-bar-in-next-js-13-e5540789a017
    return (
        <> 
          <div className="w-full h-20 bg-black sticky top-0">
            <div className="container mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full">
                    <ul className="hidden md:flex gap-x-6 text-white">
                    <a href="/">Air Quality</a>
                    <a href="/datasource">Add Data Source</a>
                    </ul>
                </div>
            </div>
          </div>
        </>
    );
};

export default Navbar;