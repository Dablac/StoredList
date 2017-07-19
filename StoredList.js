function StoredList(name, timestamp, storageHandler){
    Array.prototype.storedListErase = function(index){
        this.splice(index, 1);
        return this;
    };
    this.wrapHandler = function(handler){
        return function(event){
            if (event.key === this.name && event.newValue !== event.oldValue){
                this.list = localStorage[this.name]; 
                //let isAddition = event.oldValue.length < event.newValue.length;
                //var id = isAddition ? event.newValue.slice(event.oldValue.length, -1) : event.oldValue.slice(event.newValue.length, -1);
                //Do something with id that was added/removed
                handler.call(event, event);
            }
        }.bind(this);
    };
    if (!localStorage[name]){ if (typeof GM_getResourceText === 'function') localStorage.setItem(name, GM_getResourceText(name)); else localStorage.setItem(name, ''); }
    this.name = name;
    this.timestamp = timestamp || false;
    this.storageHandler = !!storageHandler ? this.wrapHandler(storageHandler) : function(event){ if (event.key === this.name && event.newValue !== event.oldValue) this.list = localStorage[this.name]; }.bind(this);
    this.now = Date.now()/3.6e6 >> 0;
    this.list = localStorage[this.name];
    window.addEventListener('storage', this.storageHandler, false);
    this.refire = function(){
        this.now = Date.now()/3.6e6 >> 0;
        this.list = localStorage[this.name];
        this.length = this.asArray().length;
    };
    this.save = function saveList(newList){
        if (newList.constructor === Array) newList = newList.join('|');
        if (newList[newList.length-1] !== '|') newList += '|';
        localStorage[this.name] = newList;
        this.list = localStorage[this.name];
        return this.list;
    };
    this.inList = function inList(id, list){
        list = list || this.list;
        return (list.includes(id+'|') && !list.includes(':'+id+'|')) || list.includes(id+':');
    };
    this.add = function addItem(id){
        if (!this.inList(id)){ 
            this.save(this.list+id+(this.timestamp ? ':'+this.now+'|' : '|'));
            return true;
        } else return false;
        this.refire();
    };
    this.getIndex = function getIndex(id){
        this.add(id);
        return this.asArray().findIndex(function(e, i, a){
            return e.includes(id);
        });
    };
    this.setTime = function setTime(id){
        this.refire();
        var array = this.asArray();
        var index = this.getIndex(id);
        array[index] = array[index].split(':')[0]+':'+this.now;
        this.save(array);
    };
    this.getTime = function getTime(id){
        return parseInt(this.asArray()[this.getIndex(id)].slice(0, id.length), 10);
    };
    this.remove = function removeItem(id){
        if (this.inList(id)) this.save(this.asArray().storedListErase(this.getIndex(id)));
        if (this.inList(id)) this.remove(id);
    };
    this.asArray = function listAsArray(){
        return this.list.slice(0, this.list.length-1).split('|');
    };
}
