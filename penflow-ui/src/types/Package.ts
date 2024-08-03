
type Package = {
    id: number,
    name: string,
    displayName: string,
    description?: string,
    version?: string,
    iconUrl?: string,
    authors?: string[],
    tags?: string[],
    dependencies?: string[],
    tasks?: string[],
};

/************************************************************************/
/* API                                                                  */
/************************************************************************/

type PackageAPI = Package;